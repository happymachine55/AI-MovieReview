// Local PostgreSQL → Supabase 데이터 마이그레이션
// 사용법: node migrate_local_to_supabase.js
require('dotenv').config();
const { Client } = require('pg');

// 로컬 PostgreSQL (gallery_movie_local)
const srcUrl = process.env.DATABASE_URL;
// Supabase PostgreSQL
const dstUrl = process.env.SUPABASE_DB_URL;

if (!srcUrl || !dstUrl) {
  console.error('❌ DATABASE_URL, SUPABASE_DB_URL(.env) 설정 필요');
  console.error('현재 설정:');
  console.error('  DATABASE_URL:', srcUrl ? '✅ 설정됨' : '❌ 없음');
  console.error('  SUPABASE_DB_URL:', dstUrl ? '✅ 설정됨' : '❌ 없음');
  process.exit(1);
}

const TABLES = ['users', 'posts', 'reviews', 'comments', 'feedbacks'];

async function migrate() {
  console.log('\n🚀 Local PostgreSQL → Supabase 데이터 마이그레이션 시작\n');
  
  const src = new Client({ connectionString: srcUrl });
  const dst = new Client({ connectionString: dstUrl });
  
  try {
    console.log('📡 Local PostgreSQL 연결 중...');
    await src.connect();
    console.log('✅ Local PostgreSQL 연결 성공\n');
    
    console.log('📡 Supabase DB 연결 중...');
    await dst.connect();
    console.log('✅ Supabase DB 연결 성공\n');
    
    for (const table of TABLES) {
      console.log(`\n[${table}] 데이터 복사 시작`);
      
      try {
        const { rows } = await src.query(`SELECT * FROM ${table} ORDER BY id`);
        console.log(`  └─ ${rows.length}개 row 발견`);
        
        if (rows.length === 0) {
          console.log(`[${table}] ⚠️  데이터 없음, 스킵`);
          continue;
        }
        
        let successCount = 0;
        let skipCount = 0;
        
        for (const row of rows) {
          // 컬럼명/값 추출
          const keys = Object.keys(row);
          const vals = keys.map(k => row[k]);
          const placeholders = keys.map((_, i) => `$${i+1}`).join(',');
          const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          try {
            const result = await dst.query(sql, vals);
            if (result.rowCount > 0) {
              successCount++;
            } else {
              skipCount++;
            }
          } catch (e) {
            console.error(`  ❌ row insert error:`, e.message);
          }
        }
        console.log(`[${table}] ✅ ${successCount}개 복사 완료, ${skipCount}개 스킵(중복)`);
      } catch (tableError) {
        console.error(`[${table}] ❌ 테이블 조회 실패:`, tableError.message);
      }
    }
    
    await src.end();
    await dst.end();
    console.log('\n\n🎉 모든 데이터 복사 완료!\n');
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    console.error(error);
    try {
      await src.end();
      await dst.end();
    } catch (e) {}
    process.exit(1);
  }
}

migrate().catch(e => { console.error(e); process.exit(1); });
