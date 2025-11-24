// MySQL → Supabase (REST API 사용)
// Edge Functions를 통해 데이터 마이그레이션
require('dotenv').config();
const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

// MySQL 연결 정보
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1111',
  database: process.env.DB_NAME || 'gallery_movie'
};

// Supabase API 정보
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요');
  process.exit(1);
}

const API_BASE = `${SUPABASE_URL}/rest/v1`;

async function migrateUsers() {
  console.log('\n[users] 데이터 마이그레이션 시작');
  
  const conn = await mysql.createConnection(mysqlConfig);
  const [rows] = await conn.query('SELECT * FROM users ORDER BY id');
  console.log(`  └─ ${rows.length}개 발견`);
  
  let successCount = 0;
  
  for (const user of rows) {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({
          id: user.id,
          username: user.username,
          password: user.password,
          profile_image: user.profile_image,
          created_at: user.created_at
        })
      });
      
      if (res.ok || res.status === 409) {
        successCount++;
      } else {
        const error = await res.text();
        console.error(`  ❌ User ${user.username}: ${error}`);
      }
    } catch (e) {
      console.error(`  ❌ User ${user.username}: ${e.message}`);
    }
  }
  
  await conn.end();
  console.log(`[users] ✅ ${successCount}/${rows.length}개 완료\n`);
  return rows;
}

async function migratePosts(users) {
  console.log('\n[posts] 데이터 마이그레이션 시작');
  
  const conn = await mysql.createConnection(mysqlConfig);
  const [rows] = await conn.query('SELECT * FROM posts ORDER BY id');
  console.log(`  └─ ${rows.length}개 발견`);
  
  let successCount = 0;
  
  for (const post of rows) {
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({
          id: post.id,
          user_id: post.user_id,
          title: post.title,
          content: post.content,
          views: post.views || 0,
          recommend: post.recommend || 0,
          likes_count: post.likes_count || 0,
          dislikes_count: post.dislikes_count || 0,
          created_at: post.created_at
        })
      });
      
      if (res.ok || res.status === 409) {
        successCount++;
      } else {
        const error = await res.text();
        console.error(`  ❌ Post ${post.id}: ${error}`);
      }
    } catch (e) {
      console.error(`  ❌ Post ${post.id}: ${e.message}`);
    }
  }
  
  await conn.end();
  console.log(`[posts] ✅ ${successCount}/${rows.length}개 완료\n`);
}

async function migrateReviews() {
  console.log('\n[reviews] 데이터 마이그레이션 시작');
  
  const conn = await mysql.createConnection(mysqlConfig);
  const [rows] = await conn.query('SELECT * FROM reviews ORDER BY id');
  console.log(`  └─ ${rows.length}개 발견`);
  
  let successCount = 0;
  
  for (const review of rows) {
    try {
      // rating을 정수로 변환 (소수점이면 반올림)
      const rating = Math.round(parseFloat(review.rating || review.score || 5));
      
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({
          id: review.id,
          user_id: review.user_id,
          movie_title: review.movie_title,
          rating: rating,
          content: review.content,
          recommend: review.recommend,
          likes_count: review.likes_count || 0,
          dislikes_count: review.dislikes_count || 0,
          created_at: review.created_at
        })
      });
      
      if (res.ok || res.status === 409) {
        successCount++;
      } else {
        const error = await res.text();
        console.error(`  ❌ Review ${review.id}: ${error}`);
      }
    } catch (e) {
      console.error(`  ❌ Review ${review.id}: ${e.message}`);
    }
  }
  
  await conn.end();
  console.log(`[reviews] ✅ ${successCount}/${rows.length}개 완료\n`);
}

async function migrateComments() {
  console.log('\n[comments] 데이터 마이그레이션 시작');
  
  const conn = await mysql.createConnection(mysqlConfig);
  const [rows] = await conn.query('SELECT * FROM comments ORDER BY id');
  console.log(`  └─ ${rows.length}개 발견`);
  
  let successCount = 0;
  
  for (const comment of rows) {
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({
          id: comment.id,
          post_id: comment.post_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at
        })
      });
      
      if (res.ok || res.status === 409) {
        successCount++;
      } else {
        const error = await res.text();
        console.error(`  ❌ Comment ${comment.id}: ${error}`);
      }
    } catch (e) {
      console.error(`  ❌ Comment ${comment.id}: ${e.message}`);
    }
  }
  
  await conn.end();
  console.log(`[comments] ✅ ${successCount}/${rows.length}개 완료\n`);
}

async function migrate() {
  console.log('\n🚀 MySQL → Supabase (REST API) 마이그레이션 시작\n');
  
  try {
    const users = await migrateUsers();
    await migratePosts(users);
    await migrateReviews();
    await migrateComments();
    
    console.log('\n🎉 모든 데이터 마이그레이션 완료!\n');
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
