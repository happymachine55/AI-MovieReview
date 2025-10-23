// Render PostgreSQL 테이블 생성 스크립트
// DBeaver 대신 Node.js로 직접 테이블 생성

const { Client } = require('pg');

// Render PostgreSQL Internal Database URL
const DATABASE_URL = 'postgresql://gallery_movie_l9rv_user:NEgN7qT3L5jlpGlehvY3LrVcn6zwKizJ@dpg-d3sti2prf0fns738p1ee0-a.singapore-postgres.render.com/gallery_movie_l9rv';

async function createTables() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔌 Render PostgreSQL 연결 중...');
        await client.connect();
        console.log('✅ 연결 성공!\n');

        // 1. 기존 타입/테이블 삭제
        console.log('🗑️  기존 테이블 삭제 중...');
        await client.query('DROP TYPE IF EXISTS like_type CASCADE');
        await client.query('DROP TABLE IF EXISTS post_likes CASCADE');
        await client.query('DROP TABLE IF EXISTS review_likes CASCADE');
        await client.query('DROP TABLE IF EXISTS comments CASCADE');
        await client.query('DROP TABLE IF EXISTS posts CASCADE');
        await client.query('DROP TABLE IF EXISTS reviews CASCADE');
        await client.query('DROP TABLE IF EXISTS users CASCADE');
        console.log('✅ 기존 테이블 삭제 완료\n');

        // 2. users 테이블
        console.log('👥 users 테이블 생성 중...');
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ users 테이블 생성 완료');

        // 3. reviews 테이블
        console.log('⭐ reviews 테이블 생성 중...');
        await client.query(`
            CREATE TABLE reviews (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                movie_title VARCHAR(255) NOT NULL,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
                content TEXT,
                recommend VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                likes_count INTEGER DEFAULT 0,
                dislikes_count INTEGER DEFAULT 0
            )
        `);
        console.log('✅ reviews 테이블 생성 완료');

        // 4. posts 테이블
        console.log('📝 posts 테이블 생성 중...');
        await client.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                views INTEGER DEFAULT 0,
                recommend INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                likes_count INTEGER DEFAULT 0,
                dislikes_count INTEGER DEFAULT 0
            )
        `);
        console.log('✅ posts 테이블 생성 완료');

        // 5. comments 테이블
        console.log('💬 comments 테이블 생성 중...');
        await client.query(`
            CREATE TABLE comments (
                id SERIAL PRIMARY KEY,
                post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ comments 테이블 생성 완료');

        // 6. ENUM 타입 생성
        console.log('🔧 like_type ENUM 생성 중...');
        await client.query(`CREATE TYPE like_type AS ENUM ('like', 'dislike')`);
        console.log('✅ like_type ENUM 생성 완료');

        // 7. review_likes 테이블
        console.log('👍 review_likes 테이블 생성 중...');
        await client.query(`
            CREATE TABLE review_likes (
                id SERIAL PRIMARY KEY,
                review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                like_type like_type NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(review_id, user_id)
            )
        `);
        console.log('✅ review_likes 테이블 생성 완료');

        // 8. post_likes 테이블
        console.log('👍 post_likes 테이블 생성 중...');
        await client.query(`
            CREATE TABLE post_likes (
                id SERIAL PRIMARY KEY,
                post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                like_type like_type NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(post_id, user_id)
            )
        `);
        console.log('✅ post_likes 테이블 생성 완료');

        // 9. 인덱스 생성
        console.log('\n📊 인덱스 생성 중...');
        await client.query('CREATE INDEX idx_reviews_movie ON reviews(movie_title)');
        await client.query('CREATE INDEX idx_reviews_user ON reviews(user_id)');
        await client.query('CREATE INDEX idx_posts_user ON posts(user_id)');
        await client.query('CREATE INDEX idx_posts_created ON posts(created_at DESC)');
        await client.query('CREATE INDEX idx_comments_post ON comments(post_id)');
        await client.query('CREATE INDEX idx_comments_user ON comments(user_id)');
        await client.query('CREATE INDEX idx_review_likes_review ON review_likes(review_id)');
        await client.query('CREATE INDEX idx_review_likes_user ON review_likes(user_id)');
        await client.query('CREATE INDEX idx_post_likes_post ON post_likes(post_id)');
        await client.query('CREATE INDEX idx_post_likes_user ON post_likes(user_id)');
        console.log('✅ 인덱스 생성 완료');

        // 10. 테이블 목록 확인
        console.log('\n📋 생성된 테이블 확인 중...');
        const result = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);

        console.log('\n🎉 성공! 생성된 테이블:');
        result.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.tablename}`);
        });

        console.log('\n✨ PostgreSQL 테이블 생성 완료!');

    } catch (error) {
        console.error('\n❌ 에러 발생:', error.message);
        console.error('상세 내용:', error);
    } finally {
        await client.end();
        console.log('\n🔌 연결 종료');
    }
}

// 실행
createTables();
