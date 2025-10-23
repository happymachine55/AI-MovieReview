// ========================================================
// 🔄 PostgreSQL(Render) → MySQL(로컬) 역방향 동기화
// ========================================================
// 사용법: node sync_postgres_to_mysql.js
// 기능: Render PostgreSQL의 변경사항을 로컬 MySQL에 자동 반영

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

// 동기화 주기 (밀리초) - 기본 10초
const SYNC_INTERVAL = parseInt(process.env.REVERSE_SYNC_INTERVAL) || 10000;

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

async function syncTableToMySQL(pgClient, mysqlConn, tableName, columns) {
  try {
    // PostgreSQL에서 마지막 동기화 이후 변경된 데이터만 가져오기
    const result = await pgClient.query(
      `SELECT * FROM ${tableName} WHERE created_at > $1 ORDER BY id`,
      [lastSync[tableName]]
    );
    
    const rows = result.rows;

    if (rows.length === 0) {
      return { table: tableName, synced: 0, action: 'none' };
    }

    console.log(`📊 ${tableName}: ${rows.length}개의 새로운 레코드 발견 (PostgreSQL → MySQL)`);

    // MySQL에 데이터 동기화 (UPSERT)
    for (const row of rows) {
      const columnNames = columns.join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const updateSet = columns
        .filter(col => col !== 'id') // id는 업데이트하지 않음
        .map(col => `${col} = VALUES(${col})`)
        .join(', ');
      
      const sql = `
        INSERT INTO ${tableName} (${columnNames}) 
        VALUES (${placeholders})
        ON DUPLICATE KEY UPDATE ${updateSet}
      `;
      
      const values = columns.map(col => {
        // rating은 정수로 변환
        if (col === 'rating' && row[col] !== null) {
          return parseInt(row[col]) || 0;
        }
        return row[col];
      });
      
      await mysqlConn.execute(sql, values);
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

async function syncDeletesToMySQL(pgClient, mysqlConn, tableName) {
  try {
    // PostgreSQL의 현재 ID 목록
    const pgResult = await pgClient.query(`SELECT id FROM ${tableName}`);
    const pgIds = new Set(pgResult.rows.map(r => r.id));

    // MySQL의 현재 ID 목록
    const [mysqlRows] = await mysqlConn.execute(`SELECT id FROM ${tableName}`);
    const mysqlIds = mysqlRows.map(r => r.id);

    // MySQL에는 있지만 PostgreSQL에는 없는 ID = 삭제된 레코드
    const deletedIds = mysqlIds.filter(id => !pgIds.has(id));

    if (deletedIds.length > 0) {
      console.log(`🗑️  ${tableName}: ${deletedIds.length}개의 삭제된 레코드 감지 (PostgreSQL → MySQL)`);
      
      for (const id of deletedIds) {
        await mysqlConn.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
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

async function performReverseSync() {
  let mysqlConn, pgClient;

  try {
    // PostgreSQL 연결
    pgClient = new Client({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false }
    });
    await pgClient.connect();

    // MySQL 연결
    mysqlConn = await mysql.createConnection(mysqlConfig);

    console.log('🔄 역방향 동기화 시작 (PostgreSQL → MySQL)...');

    // 각 테이블 동기화
    const syncResults = await Promise.all([
      syncTableToMySQL(pgClient, mysqlConn, 'users', ['id', 'username', 'password', 'created_at']),
      syncTableToMySQL(pgClient, mysqlConn, 'reviews', ['id', 'user_id', 'movie_title', 'rating', 'content', 'recommend', 'created_at', 'likes_count', 'dislikes_count']),
      syncTableToMySQL(pgClient, mysqlConn, 'posts', ['id', 'user_id', 'title', 'content', 'views', 'recommend', 'created_at', 'likes_count', 'dislikes_count']),
      syncTableToMySQL(pgClient, mysqlConn, 'comments', ['id', 'post_id', 'user_id', 'content', 'created_at']),
      syncTableToMySQL(pgClient, mysqlConn, 'review_likes', ['id', 'review_id', 'user_id', 'like_type', 'created_at']),
      syncTableToMySQL(pgClient, mysqlConn, 'post_likes', ['id', 'post_id', 'user_id', 'like_type', 'created_at'])
    ]);

    // 삭제된 레코드 동기화
    const deleteResults = await Promise.all([
      syncDeletesToMySQL(pgClient, mysqlConn, 'comments'),
      syncDeletesToMySQL(pgClient, mysqlConn, 'review_likes'),
      syncDeletesToMySQL(pgClient, mysqlConn, 'post_likes'),
      syncDeletesToMySQL(pgClient, mysqlConn, 'reviews'),
      syncDeletesToMySQL(pgClient, mysqlConn, 'posts'),
      syncDeletesToMySQL(pgClient, mysqlConn, 'users')
    ]);

    // 결과 요약
    const totalSynced = syncResults.reduce((sum, r) => sum + r.synced, 0);
    const totalDeleted = deleteResults.reduce((sum, r) => sum + r.deleted, 0);

    if (totalSynced > 0 || totalDeleted > 0) {
      console.log(`✅ 역방향 동기화 완료: ${totalSynced}개 추가/수정, ${totalDeleted}개 삭제`);
      console.log(`⏰ 다음 동기화: ${SYNC_INTERVAL / 1000}초 후\n`);
    } else {
      console.log(`✅ 변경사항 없음 (${new Date().toLocaleTimeString()})\n`);
    }

  } catch (error) {
    console.error('❌ 역방향 동기화 오류:', error.message);
  } finally {
    // 연결 종료
    if (mysqlConn) await mysqlConn.end();
    if (pgClient) await pgClient.end();
  }
}

// ========================================================
// 메인 실행
// ========================================================

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   PostgreSQL(Render) → MySQL(로컬) 역방향 동기화 시작    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`⏱️  동기화 주기: ${SYNC_INTERVAL / 1000}초`);
console.log(`🔗 PostgreSQL: ${postgresUrl.split('@')[1]}`);
console.log(`🔗 MySQL: ${mysqlConfig.host}/${mysqlConfig.database}\n`);
console.log('💡 종료하려면 Ctrl+C를 누르세요\n');

// 즉시 첫 동기화 실행
performReverseSync();

// 주기적 동기화 시작
const syncTimer = setInterval(performReverseSync, SYNC_INTERVAL);

// 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n\n🛑 역방향 동기화 중지 중...');
  clearInterval(syncTimer);
  console.log('✅ 역방향 동기화가 안전하게 종료되었습니다.');
  process.exit(0);
});
