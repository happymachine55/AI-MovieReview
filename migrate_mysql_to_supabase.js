// MySQL(gallery_movie) → Supabase 데이터 마이그레이션
// 사용법: node migrate_mysql_to_supabase.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const { Client } = require('pg');

// MySQL 연결 정보
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1111',
  database: process.env.DB_NAME || 'gallery_movie'
};

// Supabase PostgreSQL 연결
const supabaseUrl = process.env.SUPABASE_DB_URL;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_DB_URL(.env) 설정 필요');
  process.exit(1);
}

const TABLES = ['users', 'posts', 'reviews', 'comments', 'feedbacks'];

async function migrate() {
  console.log('\n🚀 MySQL → Supabase 데이터 마이그레이션 시작\n');
  
  let mysqlConn;
  let supabaseConn;
  
  try {
    // MySQL 연결
    console.log('📡 MySQL 연결 중...');
    mysqlConn = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL 연결 성공\n');
    
    // Supabase 연결
    console.log('📡 Supabase DB 연결 중...');
    supabaseConn = new Client({ connectionString: supabaseUrl });
    await supabaseConn.connect();
    console.log('✅ Supabase DB 연결 성공\n');
    
    for (const table of TABLES) {
      console.log(`\n[${table}] 데이터 복사 시작`);
      
      try {
        // MySQL에서 데이터 조회
        const [rows] = await mysqlConn.query(`SELECT * FROM ${table} ORDER BY id`);
        console.log(`  └─ ${rows.length}개 row 발견`);
        
        if (rows.length === 0) {
          console.log(`[${table}] ⚠️  데이터 없음, 스킵`);
          continue;
        }
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        
        for (const row of rows) {
          // 컬럼명/값 추출
          const keys = Object.keys(row);
          const vals = keys.map(k => row[k]);
          const placeholders = keys.map((_, i) => `$${i+1}`).join(',');
          const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          
          try {
            const result = await supabaseConn.query(sql, vals);
            if (result.rowCount > 0) {
              successCount++;
            } else {
              skipCount++;
            }
          } catch (e) {
            console.error(`  ❌ row insert error:`, e.message);
            errorCount++;
          }
        }
        
        console.log(`[${table}] ✅ ${successCount}개 복사 완료, ${skipCount}개 스킵(중복), ${errorCount}개 오류`);
      } catch (tableError) {
        console.error(`[${table}] ❌ 테이블 조회 실패:`, tableError.message);
      }
    }
    
    await mysqlConn.end();
    await supabaseConn.end();
    console.log('\n\n🎉 모든 데이터 복사 완료!\n');
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    console.error(error);
    try {
      if (mysqlConn) await mysqlConn.end();
      if (supabaseConn) await supabaseConn.end();
    } catch (e) {}
    process.exit(1);
  }
}

migrate().catch(e => { console.error(e); process.exit(1); });
