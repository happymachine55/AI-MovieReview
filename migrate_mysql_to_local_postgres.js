// MySQL → 로컬 PostgreSQL 마이그레이션
require('dotenv').config();
const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// MySQL 연결
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1111',
  database: process.env.DB_NAME || 'gallery_movie'
};

// PostgreSQL 로컬 연결
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1111@localhost:5432/gallery_movie_local'
});

async function migrate() {
  let mysqlConn;
  
  try {
    console.log('\n🚀 MySQL → 로컬 PostgreSQL 마이그레이션 시작\n');
    
    // MySQL 연결
    mysqlConn = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL 연결 성공');
    
    // PostgreSQL 테스트
    await pgPool.query('SELECT NOW()');
    console.log('✅ PostgreSQL 연결 성공\n');
    
    // 1. Users 마이그레이션
    console.log('[users] 데이터 마이그레이션 시작');
    const [users] = await mysqlConn.query('SELECT * FROM users');
    console.log(`  └─ ${users.length}개 발견`);
    
    let userCount = 0;
    for (const user of users) {
      // 비밀번호가 이미 bcrypt 해시인지 확인 ($2b$로 시작)
      let hashedPassword = user.password;
      if (!hashedPassword.startsWith('$2b$')) {
        // 평문 비밀번호면 해시화
        hashedPassword = await bcrypt.hash(user.password, 10);
      }
      
      try {
        await pgPool.query(
          `INSERT INTO users (id, username, password, profile_image, created_at) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (id) DO UPDATE SET 
           username = EXCLUDED.username,
           password = EXCLUDED.password,
           profile_image = EXCLUDED.profile_image`,
          [user.id, user.username, hashedPassword, user.profile_image, user.created_at]
        );
        userCount++;
      } catch (err) {
        console.log(`  ⚠️  user ${user.username} 실패:`, err.message);
      }
    }
    console.log(`[users] ✅ ${userCount}/${users.length}개 완료\n`);
    
    // 2. Posts 마이그레이션
    console.log('[posts] 데이터 마이그레이션 시작');
    const [posts] = await mysqlConn.query('SELECT * FROM posts');
    console.log(`  └─ ${posts.length}개 발견`);
    
    let postCount = 0;
    for (const post of posts) {
      try {
        await pgPool.query(
          `INSERT INTO posts (id, user_id, title, content, movie_title, created_at, likes_count, dislikes_count) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           ON CONFLICT (id) DO UPDATE SET 
           title = EXCLUDED.title,
           content = EXCLUDED.content`,
          [post.id, post.user_id, post.title, post.content, post.movie_title, post.created_at, post.likes_count || 0, post.dislikes_count || 0]
        );
        postCount++;
      } catch (err) {
        console.log(`  ⚠️  post ${post.id} 실패:`, err.message);
      }
    }
    console.log(`[posts] ✅ ${postCount}/${posts.length}개 완료\n`);
    
    // 3. Reviews 마이그레이션
    console.log('[reviews] 데이터 마이그레이션 시작');
    const [reviews] = await mysqlConn.query('SELECT * FROM reviews');
    console.log(`  └─ ${reviews.length}개 발견`);
    
    let reviewCount = 0;
    for (const review of reviews) {
      const rating = Math.round(parseFloat(review.rating || review.score || 5));
      try {
        await pgPool.query(
          `INSERT INTO reviews (id, user_id, movie_title, rating, content, recommend, likes_count, dislikes_count, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           ON CONFLICT (id) DO UPDATE SET 
           rating = EXCLUDED.rating,
           content = EXCLUDED.content`,
          [review.id, review.user_id, review.movie_title, rating, review.content, review.recommend, review.likes_count || 0, review.dislikes_count || 0, review.created_at]
        );
        reviewCount++;
      } catch (err) {
        console.log(`  ⚠️  review ${review.id} 실패:`, err.message);
      }
    }
    console.log(`[reviews] ✅ ${reviewCount}/${reviews.length}개 완료\n`);
    
    // 4. Comments 마이그레이션
    console.log('[comments] 데이터 마이그레이션 시작');
    const [comments] = await mysqlConn.query('SELECT * FROM comments');
    console.log(`  └─ ${comments.length}개 발견`);
    
    let commentCount = 0;
    for (const comment of comments) {
      try {
        await pgPool.query(
          `INSERT INTO comments (id, post_id, user_id, content, created_at) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (id) DO NOTHING`,
          [comment.id, comment.post_id, comment.user_id, comment.content, comment.created_at]
        );
        commentCount++;
      } catch (err) {
        console.log(`  ⚠️  comment ${comment.id} 실패:`, err.message);
      }
    }
    console.log(`[comments] ✅ ${commentCount}/${comments.length}개 완료\n`);
    
    console.log('🎉 모든 데이터 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  } finally {
    if (mysqlConn) await mysqlConn.end();
    await pgPool.end();
  }
}

migrate();
