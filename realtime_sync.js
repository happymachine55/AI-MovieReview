// ========================================================
// 🔄 MySQL → PostgreSQL 실시간 동기화 스크립트
// ========================================================
// 사용법: node realtime_sync.js
// 기능: MySQL의 변경사항을 주기적으로 감지하여 PostgreSQL에 자동 반영

require('dotenv').config();
const mysql = require('mysql2/promise');
const { Client } = require('pg');

// ========================================================
// 설정
// ========================================================

// MySQL 연결 정보 (로컬)
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'gallery_movie'
};

// PostgreSQL 연결 정보 (Render)
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!postgresUrl) {
  console.error('❌ 오류: POSTGRES_URL 환경 변수가 설정되지 않았습니다!');
  process.exit(1);
}

// 동기화 주기 (밀리초) - 기본 5초
const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL) || 5000;

// 마지막 동기화 시간 추적
let lastSync = {
  users: new Date(0),
  reviews: new Date(0),
  posts: new Date(0),
  comments: new Date(0),
  review_likes: new Date(0),
  post_likes: new Date(0)
};

// ========================================================
// 동기화 함수
// ========================================================

async function syncTable(mysqlConn, pgClient, tableName, columns) {
  try {
    // MySQL에서 마지막 동기화 이후 변경된 데이터만 가져오기 (created_at 기준)
    const [rows] = await mysqlConn.execute(
      `SELECT * FROM ${tableName} WHERE created_at > ? ORDER BY id`,
      [lastSync[tableName]]
    );

    if (rows.length === 0) {
      return { table: tableName, synced: 0, action: 'none' };
    }

    console.log(`📊 ${tableName}: ${rows.length}개의 새로운 레코드 발견`);

    // PostgreSQL에 데이터 동기화 (UPSERT)
    for (const row of rows) {
      const columnNames = columns.join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const updateSet = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
      
      const sql = `
        INSERT INTO ${tableName} (${columnNames}) 
        VALUES (${placeholders})
        ON CONFLICT (id) DO UPDATE SET ${updateSet}
      `;
      
      const values = columns.map(col => {
        // rating은 정수로 변환
        if (col === 'rating' && row[col] !== null) {
          return parseInt(row[col]) || 0;
        }
        return row[col];
      });
      
      await pgClient.query(sql, values);
    }

    // 마지막 동기화 시간 업데이트
    lastSync[tableName] = new Date();

    return { table: tableName, synced: rows.length, action: 'synced' };

  } catch (error) {
    console.error(`❌ ${tableName} 동기화 오류:`, error.message);
    return { table: tableName, synced: 0, action: 'error', error: error.message };
  }
}

// ========================================================
// 삭제된 레코드 감지 및 동기화
// ========================================================

async function syncDeletes(mysqlConn, pgClient, tableName) {
  try {
    // MySQL의 현재 ID 목록
    const [mysqlRows] = await mysqlConn.execute(`SELECT id FROM ${tableName}`);
    const mysqlIds = new Set(mysqlRows.map(r => r.id));

    // PostgreSQL의 현재 ID 목록
    const pgResult = await pgClient.query(`SELECT id FROM ${tableName}`);
    const pgIds = pgResult.rows.map(r => r.id);

    // PostgreSQL에는 있지만 MySQL에는 없는 ID = 삭제된 레코드
    const deletedIds = pgIds.filter(id => !mysqlIds.has(id));

    if (deletedIds.length > 0) {
      console.log(`🗑️  ${tableName}: ${deletedIds.length}개의 삭제된 레코드 감지`);
      
      for (const id of deletedIds) {
        await pgClient.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
      }

      return { table: tableName, deleted: deletedIds.length };
    }

    return { table: tableName, deleted: 0 };

  } catch (error) {
    console.error(`❌ ${tableName} 삭제 동기화 오류:`, error.message);
    return { table: tableName, deleted: 0, error: error.message };
  }
}

// ========================================================
// 전체 동기화 실행
// ========================================================

async function performSync() {
  let mysqlConn, pgClient;

  try {
    // MySQL 연결
    mysqlConn = await mysql.createConnection(mysqlConfig);

    // PostgreSQL 연결
    pgClient = new Client({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false }
    });
    await pgClient.connect();

    console.log('🔄 동기화 시작...');

    // 각 테이블 동기화
    const syncResults = await Promise.all([
      syncTable(mysqlConn, pgClient, 'users', ['id', 'username', 'password', 'created_at']),
      syncTable(mysqlConn, pgClient, 'reviews', ['id', 'user_id', 'movie_title', 'rating', 'content', 'recommend', 'created_at', 'likes_count', 'dislikes_count']),
      syncTable(mysqlConn, pgClient, 'posts', ['id', 'user_id', 'title', 'content', 'views', 'recommend', 'created_at', 'likes_count', 'dislikes_count']),
      syncTable(mysqlConn, pgClient, 'comments', ['id', 'post_id', 'user_id', 'content', 'created_at']),
      syncTable(mysqlConn, pgClient, 'review_likes', ['id', 'review_id', 'user_id', 'like_type', 'created_at']),
      syncTable(mysqlConn, pgClient, 'post_likes', ['id', 'post_id', 'user_id', 'like_type', 'created_at'])
    ]);

    // 삭제된 레코드 동기화
    const deleteResults = await Promise.all([
      syncDeletes(mysqlConn, pgClient, 'comments'),
      syncDeletes(mysqlConn, pgClient, 'review_likes'),
      syncDeletes(mysqlConn, pgClient, 'post_likes'),
      syncDeletes(mysqlConn, pgClient, 'reviews'),
      syncDeletes(mysqlConn, pgClient, 'posts'),
      syncDeletes(mysqlConn, pgClient, 'users')
    ]);

    // 결과 요약
    const totalSynced = syncResults.reduce((sum, r) => sum + r.synced, 0);
    const totalDeleted = deleteResults.reduce((sum, r) => sum + r.deleted, 0);

    if (totalSynced > 0 || totalDeleted > 0) {
      console.log(`✅ 동기화 완료: ${totalSynced}개 추가/수정, ${totalDeleted}개 삭제`);
      console.log(`⏰ 다음 동기화: ${SYNC_INTERVAL / 1000}초 후\n`);
    } else {
      console.log(`✅ 변경사항 없음 (${new Date().toLocaleTimeString()})\n`);
    }

  } catch (error) {
    console.error('❌ 동기화 오류:', error.message);
  } finally {
    // 연결 종료
    if (mysqlConn) await mysqlConn.end();
    if (pgClient) await pgClient.end();
  }
}

// ========================================================
// 스키마 변경 감지 및 동기화
// ========================================================

async function checkSchemaChanges() {
  let mysqlConn, pgClient;

  try {
    mysqlConn = await mysql.createConnection(mysqlConfig);
    pgClient = new Client({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false }
    });
    await pgClient.connect();

    // MySQL 테이블 목록
    const [mysqlTables] = await mysqlConn.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [mysqlConfig.database]
    );

    // PostgreSQL 테이블 목록
    const pgTables = await pgClient.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );

    const mysqlTableNames = new Set(mysqlTables.map(t => t.TABLE_NAME));
    const pgTableNames = new Set(pgTables.rows.map(t => t.tablename));

    // 새로운 테이블 감지
    const newTables = [...mysqlTableNames].filter(t => !pgTableNames.has(t));
    
    if (newTables.length > 0) {
      console.log(`⚠️  새로운 테이블 감지: ${newTables.join(', ')}`);
      console.log('💡 create_tables.js를 실행하여 스키마를 동기화하세요!');
    }

    await mysqlConn.end();
    await pgClient.end();

  } catch (error) {
    console.error('❌ 스키마 체크 오류:', error.message);
  }
}

// ========================================================
// 메인 실행
// ========================================================

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     MySQL → PostgreSQL 실시간 동기화 시작                 ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`⏱️  동기화 주기: ${SYNC_INTERVAL / 1000}초`);
console.log(`🔗 PostgreSQL: ${postgresUrl.split('@')[1]}`);
console.log(`🔗 MySQL: ${mysqlConfig.host}/${mysqlConfig.database}\n`);
console.log('💡 종료하려면 Ctrl+C를 누르세요\n');

// 초기 스키마 체크
checkSchemaChanges();

// 즉시 첫 동기화 실행
performSync();

// 주기적 동기화 시작
const syncTimer = setInterval(performSync, SYNC_INTERVAL);

// 10분마다 스키마 변경 체크
const schemaTimer = setInterval(checkSchemaChanges, 10 * 60 * 1000);

// 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n\n🛑 동기화 중지 중...');
  clearInterval(syncTimer);
  clearInterval(schemaTimer);
  console.log('✅ 동기화가 안전하게 종료되었습니다.');
  process.exit(0);
});
