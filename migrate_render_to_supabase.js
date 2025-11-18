// Render(Postgres) → Supabase(Postgres) 데이터 마이그레이션 CLI
// 사용법: node migrate_render_to_supabase.js
// .env에 RENDER_DB_URL, SUPABASE_DB_URL 필요
require('dotenv').config();
const { Client } = require('pg');

const srcUrl = process.env.RENDER_DB_URL;
const dstUrl = process.env.SUPABASE_DB_URL;

if (!srcUrl || !dstUrl) {
  console.error('❌ RENDER_DB_URL, SUPABASE_DB_URL(.env) 설정 필요');
  console.error('현재 설정:');
  console.error('  RENDER_DB_URL:', srcUrl ? '✅ 설정됨' : '❌ 없음');
  console.error('  SUPABASE_DB_URL:', dstUrl ? '✅ 설정됨' : '❌ 없음');
  process.exit(1);
}

const TABLES = ['users', 'posts', 'reviews', 'comments', 'feedbacks'];

async function migrate() {
  console.log('\n🚀 Render → Supabase 데이터 마이그레이션 시작\n');
  
  const src = new Client({ connectionString: srcUrl });
  const dst = new Client({ connectionString: dstUrl });
  
  try {
    console.log('📡 Render DB 연결 중...');
    await src.connect();
    console.log('✅ Render DB 연결 성공\n');
    
    console.log('📡 Supabase DB 연결 중...');
    await dst.connect();
    console.log('✅ Supabase DB 연결 성공\n');
    
    for (const table of TABLES) {
      console.log(`\n[${table}] 데이터 복사 시작`);
      const { rows } = await src.query(`SELECT * FROM ${table} ORDER BY id`);
      console.log(`  └─ ${rows.length}개 row 발견`);
      
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
    }
    
    await src.end();
    await dst.end();
    console.log('\n\n🎉 모든 데이터 복사 완료!\n');
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate().catch(e => { console.error(e); process.exit(1); });
