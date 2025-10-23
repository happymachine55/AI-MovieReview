// PostgreSQL 데이터 확인 스크립트
require('dotenv').config();
const { Client } = require('pg');

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

async function checkData() {
  const client = new Client({
    connectionString: postgresUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL 연결 성공\n');

    // users 테이블 조회
    const users = await client.query('SELECT id, username, created_at FROM users ORDER BY id');
    console.log('👥 Users 테이블:');
    console.table(users.rows);

    // posts 테이블 조회
    const posts = await client.query('SELECT id, user_id, title, created_at FROM posts ORDER BY id');
    console.log('\n📝 Posts 테이블:');
    console.table(posts.rows);

    // reviews 테이블 조회
    const reviews = await client.query('SELECT id, user_id, movie_title, rating, created_at FROM reviews ORDER BY id');
    console.log('\n⭐ Reviews 테이블:');
    console.table(reviews.rows);

    // comments 테이블 조회
    const comments = await client.query('SELECT id, post_id, user_id, content, created_at FROM comments ORDER BY id');
    console.log('\n💬 Comments 테이블:');
    console.table(comments.rows);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 연결 종료');
  }
}

checkData();
