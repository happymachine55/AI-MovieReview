// ========================================================
// 📦 데이터베이스 연결 설정 (MySQL & PostgreSQL 지원)
// ========================================================

const path = require('path');
// .env 파일을 이 모듈 기준으로 명시적으로 로드합니다.
require('dotenv').config({ path: path.join(__dirname, '.env') });

// DATABASE_URL이 있으면 PostgreSQL, 없으면 MySQL 사용
const usePostgres = !!process.env.DATABASE_URL;

let pool;

if (usePostgres) {
  // ========================================================
  // � PostgreSQL 연결 (Render 배포용)
  // ========================================================
  const { Pool } = require('pg');
  
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // PostgreSQL용 쿼리 래퍼 (MySQL 문법과 호환)
  const originalQuery = pool.query.bind(pool);
  pool.query = function(sql, params, callback) {
    // MySQL의 ? placeholder를 PostgreSQL의 $1, $2로 변환
    let pgSql = sql;
    let pgParams = params;
    
    if (typeof params === 'function') {
      callback = params;
      pgParams = [];
    }
    
    if (Array.isArray(pgParams)) {
      let index = 0;
      pgSql = sql.replace(/\?/g, () => `$${++index}`);
    }

    return originalQuery(pgSql, pgParams, (err, result) => {
      if (callback) {
        // MySQL 형식으로 결과 반환
        if (err) {
          callback(err, null);
        } else {
          // PostgreSQL의 rows를 MySQL 형식으로 변환
          callback(null, result.rows || []);
        }
      }
    });
  };

  console.log('✅ PostgreSQL 연결 준비 완료');

} else {
  // ========================================================
  // 🐬 MySQL 연결 (로컬 개발용)
  // ========================================================
  const mysql = require('mysql2');
  
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log('✅ MySQL 연결 준비 완료');
}

// ========================================================
// 📤 연결 풀 내보내기
// ========================================================
module.exports = pool;

