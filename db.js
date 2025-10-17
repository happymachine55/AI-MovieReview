// ========================================================
// 📦 MySQL 데이터베이스 연결 설정
// ========================================================

// .env 파일에서 환경 변수 로드 (DB 접속 정보)
require('dotenv').config();

// mysql2 모듈 불러오기 (MySQL 연결용)
const mysql = require('mysql2');

// ========================================================
// 🔌 MySQL 연결 풀(Pool) 생성
// ========================================================
// Connection Pool: 여러 클라이언트가 동시에 DB에 접근할 수 있도록
// 미리 여러 개의 연결을 만들어두고 재사용하는 방식
const pool = mysql.createPool({
  host: process.env.DB_HOST,           // MySQL 서버 주소 (예: localhost)
  user: process.env.DB_USER,           // MySQL 사용자 이름 (예: root)
  password: process.env.DB_PASSWORD,   // MySQL 비밀번호
  database: process.env.DB_NAME,       // 사용할 데이터베이스 이름 (예: gallery_movie)
  waitForConnections: true,            // 연결이 꽉 찼을 때 대기할지 여부
  connectionLimit: 10,                 // 최대 동시 연결 개수 (10개)
  queueLimit: 0                        // 대기열 제한 (0 = 무제한)
});

// ========================================================
// 📤 연결 풀 내보내기 (app.js에서 사용)
// ========================================================
module.exports = pool;

