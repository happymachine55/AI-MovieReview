// 로컬 PostgreSQL 스키마 업데이트
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1111@localhost:5432/gallery_movie_local'
});

async function updateSchema() {
  try {
    console.log('🔧 로컬 PostgreSQL 스키마 업데이트 중...\n');
    
    // SQL 파일 읽기
    const sql = fs.readFileSync('./update_local_schema.sql', 'utf8');
    
    // 실행
    await pgPool.query(sql);
    
    console.log('✅ 스키마 업데이트 완료!\n');
    
  } catch (error) {
    console.error('❌ 스키마 업데이트 실패:', error);
  } finally {
    await pgPool.end();
  }
}

updateSchema();
