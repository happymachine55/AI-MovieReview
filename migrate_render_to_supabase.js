// Render(Postgres) → Supabase(Postgres) 데이터 마이그레이션 CLI
// 사용법: node migrate_render_to_supabase.js
// .env에 RENDER_DB_URL, SUPABASE_DB_URL 필요
require('dotenv').config();
const { Client } = require('pg');

const srcUrl = process.env.RENDER_DB_URL;
const dstUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!srcUrl || !dstUrl) {
  console.error('RENDER_DB_URL, SUPABASE_DB_URL(.env) 설정 필요');
  process.exit(1);
}

const TABLES = ['users', 'posts', 'reviews', 'comments'];

async function migrate() {
  const src = new Client({ connectionString: srcUrl });
  const dst = new Client({ connectionString: dstUrl });
  await src.connect();
  await dst.connect();
  for (const table of TABLES) {
    console.log(`\n[${table}] 데이터 복사 시작`);
    const { rows } = await src.query(`SELECT * FROM ${table}`);
    for (const row of rows) {
      // 컬럼명/값 추출
      const keys = Object.keys(row);
      const vals = keys.map(k => row[k]);
      const placeholders = keys.map((_, i) => `$${i+1}`).join(',');
      const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
      try {
        await dst.query(sql, vals);
      } catch (e) {
        console.error(`[${table}] row insert error:`, e.message);
      }
    }
    console.log(`[${table}] ${rows.length}개 복사 완료`);
  }
  await src.end();
  await dst.end();
  console.log('\n모든 데이터 복사 완료!');
}

migrate().catch(e => { console.error(e); process.exit(1); });
