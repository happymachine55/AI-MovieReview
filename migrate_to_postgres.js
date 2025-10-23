// ========================================================
// 🔄 MySQL → PostgreSQL 데이터 마이그레이션 스크립트
// ========================================================
// 사용법: node migrate_to_postgres.js

require('dotenv').config();
const mysql = require('mysql2/promise');
const { Client } = require('pg');

// ========================================================
// 설정
// ========================================================

// MySQL 연결 정보 (로컬)
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'gallery_movie'
};

// PostgreSQL 연결 정보 (Render)
// Render에서 Internal Database URL 복사해서 사용
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!postgresUrl) {
  console.error('❌ 오류: POSTGRES_URL 환경 변수가 설정되지 않았습니다!');
  console.log('💡 .env 파일에 다음을 추가하세요:');
  console.log('POSTGRES_URL=postgresql://user:password@host/database');
  process.exit(1);
}

// ========================================================
// 메인 함수
// ========================================================

async function migrateData() {
  let mysqlConn, pgClient;

  try {
    console.log('🚀 마이그레이션 시작...\n');

    // MySQL 연결
    console.log('📡 MySQL 연결 중...');
    mysqlConn = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL 연결 성공\n');

    // PostgreSQL 연결
    console.log('📡 PostgreSQL 연결 중...');
    pgClient = new Client({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false }
    });
    await pgClient.connect();
    console.log('✅ PostgreSQL 연결 성공\n');

    // ========================================================
    // 1. users 테이블 마이그레이션
    // ========================================================
    console.log('👥 users 테이블 마이그레이션 중...');
    
    // MySQL에서 데이터 가져오기
    const [users] = await mysqlConn.execute('SELECT * FROM users');
    console.log(`   📊 ${users.length}개의 사용자 발견`);

    // PostgreSQL 데이터 삭제 (선택적)
    await pgClient.query('TRUNCATE TABLE users CASCADE');
    console.log('   🗑️  기존 데이터 삭제');

    // 데이터 삽입
    for (const user of users) {
      await pgClient.query(
        'INSERT INTO users (id, username, password, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [user.id, user.username, user.password, user.created_at]
      );
    }
    console.log(`   ✅ ${users.length}개 사용자 마이그레이션 완료\n`);

    // ========================================================
    // 2. reviews 테이블 마이그레이션
    // ========================================================
    console.log('⭐ reviews 테이블 마이그레이션 중...');
    
    const [reviews] = await mysqlConn.execute('SELECT * FROM reviews');
    console.log(`   📊 ${reviews.length}개의 리뷰 발견`);

    await pgClient.query('TRUNCATE TABLE reviews CASCADE');
    console.log('   🗑️  기존 데이터 삭제');

    for (const review of reviews) {
      await pgClient.query(
        `INSERT INTO reviews (id, user_id, movie_title, rating, content, recommend, created_at, likes_count, dislikes_count) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        [
          review.id,
          review.user_id,
          review.movie_title,
          parseInt(review.rating) || 0,  // 문자열을 정수로 변환
          review.content,
          review.recommend,
          review.created_at,
          review.likes_count || 0,
          review.dislikes_count || 0
        ]
      );
    }
    console.log(`   ✅ ${reviews.length}개 리뷰 마이그레이션 완료\n`);

    // ========================================================
    // 3. posts 테이블 마이그레이션
    // ========================================================
    console.log('📝 posts 테이블 마이그레이션 중...');
    
    const [posts] = await mysqlConn.execute('SELECT * FROM posts');
    console.log(`   📊 ${posts.length}개의 게시글 발견`);

    await pgClient.query('TRUNCATE TABLE posts CASCADE');
    console.log('   🗑️  기존 데이터 삭제');

    for (const post of posts) {
      await pgClient.query(
        `INSERT INTO posts (id, user_id, title, content, views, recommend, created_at, likes_count, dislikes_count) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
        [
          post.id,
          post.user_id,
          post.title,
          post.content,
          post.views || 0,
          post.recommend || 0,
          post.created_at,
          post.likes_count || 0,
          post.dislikes_count || 0
        ]
      );
    }
    console.log(`   ✅ ${posts.length}개 게시글 마이그레이션 완료\n`);

    // ========================================================
    // 4. comments 테이블 마이그레이션
    // ========================================================
    console.log('💬 comments 테이블 마이그레이션 중...');
    
    const [comments] = await mysqlConn.execute('SELECT * FROM comments');
    console.log(`   📊 ${comments.length}개의 댓글 발견`);

    await pgClient.query('TRUNCATE TABLE comments CASCADE');
    console.log('   🗑️  기존 데이터 삭제');

    for (const comment of comments) {
      await pgClient.query(
        'INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [comment.id, comment.post_id, comment.user_id, comment.content, comment.created_at]
      );
    }
    console.log(`   ✅ ${comments.length}개 댓글 마이그레이션 완료\n`);

    // ========================================================
    // 5. review_likes 테이블 마이그레이션
    // ========================================================
    console.log('👍 review_likes 테이블 마이그레이션 중...');
    
    const [reviewLikes] = await mysqlConn.execute('SELECT * FROM review_likes');
    console.log(`   📊 ${reviewLikes.length}개의 리뷰 좋아요 발견`);

    await pgClient.query('TRUNCATE TABLE review_likes CASCADE');
    console.log('   🗑️  기존 데이터 삭제');

    for (const like of reviewLikes) {
      await pgClient.query(
        'INSERT INTO review_likes (id, review_id, user_id, like_type, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [like.id, like.review_id, like.user_id, like.like_type, like.created_at]
      );
    }
    console.log(`   ✅ ${reviewLikes.length}개 리뷰 좋아요 마이그레이션 완료\n`);

    // ========================================================
    // 6. post_likes 테이블 마이그레이션
    // ========================================================
    console.log('👍 post_likes 테이블 마이그레이션 중...');
    
    const [postLikes] = await mysqlConn.execute('SELECT * FROM post_likes');
    console.log(`   📊 ${postLikes.length}개의 게시글 좋아요 발견`);

    await pgClient.query('TRUNCATE TABLE post_likes CASCADE');
    console.log('   🗑️  기존 데이터 삭제');

    for (const like of postLikes) {
      await pgClient.query(
        'INSERT INTO post_likes (id, post_id, user_id, like_type, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [like.id, like.post_id, like.user_id, like.like_type, like.created_at]
      );
    }
    console.log(`   ✅ ${postLikes.length}개 게시글 좋아요 마이그레이션 완료\n`);

    // ========================================================
    // 시퀀스 리셋 (중요!)
    // ========================================================
    console.log('🔄 PostgreSQL 시퀀스 리셋 중...');
    
    if (users.length > 0) {
      const maxUserId = Math.max(...users.map(u => u.id));
      await pgClient.query(`SELECT setval('users_id_seq', ${maxUserId})`);
    }
    
    if (reviews.length > 0) {
      const maxReviewId = Math.max(...reviews.map(r => r.id));
      await pgClient.query(`SELECT setval('reviews_id_seq', ${maxReviewId})`);
    }
    
    if (posts.length > 0) {
      const maxPostId = Math.max(...posts.map(p => p.id));
      await pgClient.query(`SELECT setval('posts_id_seq', ${maxPostId})`);
    }
    
    if (comments.length > 0) {
      const maxCommentId = Math.max(...comments.map(c => c.id));
      await pgClient.query(`SELECT setval('comments_id_seq', ${maxCommentId})`);
    }
    
    console.log('   ✅ 시퀀스 리셋 완료\n');

    // ========================================================
    // 완료!
    // ========================================================
    console.log('🎉 마이그레이션 완료!\n');
    console.log('📊 요약:');
    console.log(`   - 사용자: ${users.length}개`);
    console.log(`   - 리뷰: ${reviews.length}개`);
    console.log(`   - 게시글: ${posts.length}개`);
    console.log(`   - 댓글: ${comments.length}개`);
    console.log(`   - 리뷰 좋아요: ${reviewLikes.length}개`);
    console.log(`   - 게시글 좋아요: ${postLikes.length}개`);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('상세 정보:', error);
    process.exit(1);
  } finally {
    // 연결 종료
    if (mysqlConn) {
      await mysqlConn.end();
      console.log('\n🔌 MySQL 연결 종료');
    }
    if (pgClient) {
      await pgClient.end();
      console.log('🔌 PostgreSQL 연결 종료');
    }
  }
}

// ========================================================
// 실행
// ========================================================

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       MySQL → PostgreSQL 데이터 마이그레이션              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

migrateData().catch(err => {
  console.error('실행 오류:', err);
  process.exit(1);
});
