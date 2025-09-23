// .env 파일의 환경 변수를 로드합니다.
require('dotenv').config();

// db.js 또는 db.config.js
const mysql = require('mysql2');
const pool = mysql.createPool({
  host: 'localhost',      // MySQL 서버 주소
  user: 'root',           // MySQL 계정
  password: 'process.env.DB_PASSWORD',   // MySQL 비밀번호
  database: 'gallery_movie', // 사용할 데이터베이스명
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
module.exports = pool;
