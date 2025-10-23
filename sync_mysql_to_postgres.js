// MySQL → PostgreSQL 완전 동기화 스크립트
// 테이블 구조 + 데이터 모두 자동 동기화

require('dotenv').config();
const mysql = require('mysql2/promise');
const { Client } = require('pg');

// 설정
const MYSQL_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'gallery_movie'
};

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
    console.error('❌ 오류: .env 파일에 POSTGRES_URL을 설정하세요!');
    process.exit(1);
}

// 컬러 출력 함수
const log = {
    header: (msg) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`),
    step: (msg) => console.log(`\n🔹 ${msg}`),
    success: (msg) => console.log(`✅ ${msg}`),
    error: (msg) => console.error(`❌ ${msg}`),
    info: (msg) => console.log(`ℹ️  ${msg}`),
    data: (msg) => console.log(`   📊 ${msg}`)
};

// MySQL → PostgreSQL 타입 매핑
function mapMySQLTypeToPostgreSQL(mysqlType) {
    const typeMap = {
        'int': 'INTEGER',
        'bigint': 'BIGINT',
        'varchar': 'VARCHAR',
        'text': 'TEXT',
        'datetime': 'TIMESTAMP',
        'timestamp': 'TIMESTAMP',
        'tinyint': 'SMALLINT',
        'enum': 'VARCHAR'
    };
    
    for (const [mysql, postgres] of Object.entries(typeMap)) {
        if (mysqlType.toLowerCase().includes(mysql)) {
            return mysqlType.replace(new RegExp(mysql, 'i'), postgres);
        }
    }
    return mysqlType.toUpperCase();
}

async function syncDatabase() {
    let mysqlConn, pgClient;

    try {
        log.header('MySQL → PostgreSQL 완전 동기화 시작');

        // MySQL 연결
        log.step('MySQL 연결 중...');
        mysqlConn = await mysql.createConnection(MYSQL_CONFIG);
        log.success(`MySQL 연결 성공: ${MYSQL_CONFIG.database}`);

        // PostgreSQL 연결
        log.step('PostgreSQL 연결 중...');
        pgClient = new Client({
            connectionString: POSTGRES_URL,
            ssl: { rejectUnauthorized: false }
        });
        await pgClient.connect();
        log.success('PostgreSQL 연결 성공');

        // 1. MySQL 테이블 목록 가져오기
        log.step('MySQL 테이블 구조 분석 중...');
        const [tables] = await mysqlConn.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME IN ('users', 'reviews', 'posts', 'comments', 'review_likes', 'post_likes')
            ORDER BY 
                CASE TABLE_NAME
                    WHEN 'users' THEN 1
                    WHEN 'reviews' THEN 2
                    WHEN 'posts' THEN 3
                    WHEN 'comments' THEN 4
                    WHEN 'review_likes' THEN 5
                    WHEN 'post_likes' THEN 6
                END
        `, [MYSQL_CONFIG.database]);

        log.data(`${tables.length}개 테이블 발견`);

        // 2. 기존 PostgreSQL 테이블 삭제
        log.step('기존 PostgreSQL 테이블 삭제 중...');
        await pgClient.query('DROP TABLE IF EXISTS post_likes CASCADE');
        await pgClient.query('DROP TABLE IF EXISTS review_likes CASCADE');
        await pgClient.query('DROP TABLE IF EXISTS comments CASCADE');
        await pgClient.query('DROP TABLE IF EXISTS posts CASCADE');
        await pgClient.query('DROP TABLE IF EXISTS reviews CASCADE');
        await pgClient.query('DROP TABLE IF EXISTS users CASCADE');
        await pgClient.query('DROP TYPE IF EXISTS like_type CASCADE');
        log.success('기존 테이블 삭제 완료');

        // 3. ENUM 타입 생성
        log.step('ENUM 타입 생성 중...');
        await pgClient.query(`CREATE TYPE like_type AS ENUM ('like', 'dislike')`);
        log.success('like_type ENUM 생성 완료');

        // 4. 각 테이블마다 구조 복사 + 데이터 마이그레이션
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            log.step(`테이블 "${tableName}" 동기화 중...`);

            // 4-1. MySQL 테이블 구조 가져오기
            const [columns] = await mysqlConn.query(`
                SELECT 
                    COLUMN_NAME,
                    COLUMN_TYPE,
                    IS_NULLABLE,
                    COLUMN_DEFAULT,
                    EXTRA,
                    COLUMN_KEY
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            `, [MYSQL_CONFIG.database, tableName]);

            // 4-2. PostgreSQL CREATE TABLE 문 생성
            let createSQL = `CREATE TABLE ${tableName} (\n`;
            const columnDefs = [];

            for (const col of columns) {
                let colDef = `    ${col.COLUMN_NAME} `;

                // AUTO_INCREMENT → SERIAL
                if (col.EXTRA.includes('auto_increment')) {
                    colDef += 'SERIAL';
                } else if (col.COLUMN_TYPE.includes('enum') && tableName.includes('likes')) {
                    // ENUM → like_type
                    colDef += 'like_type';
                } else {
                    // 타입 매핑
                    colDef += mapMySQLTypeToPostgreSQL(col.COLUMN_TYPE);
                }

                // NOT NULL
                if (col.IS_NULLABLE === 'NO' && !col.EXTRA.includes('auto_increment')) {
                    colDef += ' NOT NULL';
                }

                // DEFAULT
                if (col.COLUMN_DEFAULT && !col.EXTRA.includes('auto_increment')) {
                    if (col.COLUMN_DEFAULT === 'CURRENT_TIMESTAMP') {
                        colDef += ' DEFAULT CURRENT_TIMESTAMP';
                    } else if (!isNaN(col.COLUMN_DEFAULT)) {
                        colDef += ` DEFAULT ${col.COLUMN_DEFAULT}`;
                    } else {
                        colDef += ` DEFAULT '${col.COLUMN_DEFAULT}'`;
                    }
                }

                // PRIMARY KEY
                if (col.COLUMN_KEY === 'PRI') {
                    colDef += ' PRIMARY KEY';
                }

                // UNIQUE
                if (col.COLUMN_KEY === 'UNI') {
                    colDef += ' UNIQUE';
                }

                columnDefs.push(colDef);
            }

            createSQL += columnDefs.join(',\n');
            createSQL += '\n)';

            // 4-3. 테이블 생성
            await pgClient.query(createSQL);
            log.data(`구조 생성 완료`);

            // 4-4. 외래 키 추가
            if (tableName === 'reviews') {
                await pgClient.query(`
                    ALTER TABLE reviews 
                    ADD CONSTRAINT fk_reviews_user 
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                `);
            } else if (tableName === 'posts') {
                await pgClient.query(`
                    ALTER TABLE posts 
                    ADD CONSTRAINT fk_posts_user 
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                `);
            } else if (tableName === 'comments') {
                await pgClient.query(`
                    ALTER TABLE comments 
                    ADD CONSTRAINT fk_comments_post 
                    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                    ADD CONSTRAINT fk_comments_user 
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                `);
            } else if (tableName === 'review_likes') {
                await pgClient.query(`
                    ALTER TABLE review_likes 
                    ADD CONSTRAINT fk_review_likes_review 
                    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                    ADD CONSTRAINT fk_review_likes_user 
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    ADD CONSTRAINT unique_review_user 
                    UNIQUE (review_id, user_id)
                `);
            } else if (tableName === 'post_likes') {
                await pgClient.query(`
                    ALTER TABLE post_likes 
                    ADD CONSTRAINT fk_post_likes_post 
                    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                    ADD CONSTRAINT fk_post_likes_user 
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    ADD CONSTRAINT unique_post_user 
                    UNIQUE (post_id, user_id)
                `);
            }

            // 4-5. 데이터 복사
            const [rows] = await mysqlConn.query(`SELECT * FROM ${tableName}`);
            
            if (rows.length > 0) {
                log.data(`${rows.length}개 행 복사 중...`);

                const columnNames = Object.keys(rows[0]);
                const placeholders = columnNames.map((_, i) => `$${i + 1}`).join(', ');
                const insertSQL = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${placeholders})`;

                for (const row of rows) {
                    const values = columnNames.map(col => row[col]);
                    await pgClient.query(insertSQL, values);
                }

                // 시퀀스 리셋 (AUTO_INCREMENT 동기화)
                const idColumn = columns.find(c => c.EXTRA.includes('auto_increment'));
                if (idColumn) {
                    const maxId = Math.max(...rows.map(r => r[idColumn.COLUMN_NAME]));
                    await pgClient.query(`SELECT setval('${tableName}_${idColumn.COLUMN_NAME}_seq', ${maxId})`);
                }

                log.data(`데이터 복사 완료`);
            } else {
                log.data('데이터 없음 (빈 테이블)');
            }

            log.success(`"${tableName}" 동기화 완료\n`);
        }

        // 5. 인덱스 생성
        log.step('인덱스 생성 중...');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_reviews_movie ON reviews(movie_title)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_review_likes_review ON review_likes(review_id)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_review_likes_user ON review_likes(user_id)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id)');
        await pgClient.query('CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id)');
        log.success('인덱스 생성 완료');

        // 6. 동기화 결과 확인
        log.step('동기화 결과 확인 중...');
        for (const table of tables) {
            const result = await pgClient.query(`SELECT COUNT(*) as count FROM ${table.TABLE_NAME}`);
            log.data(`${table.TABLE_NAME}: ${result.rows[0].count}개 행`);
        }

        log.header('🎉 동기화 완료! 🎉');
        log.info('MySQL 테이블 구조와 데이터가 PostgreSQL에 완전히 복사되었습니다.');

    } catch (error) {
        log.error(`동기화 실패: ${error.message}`);
        console.error(error);
        process.exit(1);
    } finally {
        if (mysqlConn) await mysqlConn.end();
        if (pgClient) await pgClient.end();
    }
}

// 실행
syncDatabase();
