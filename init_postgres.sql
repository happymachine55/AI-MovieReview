-- ========================================================
-- PostgreSQL 데이터베이스 초기화 스크립트
-- Render PostgreSQL에서 실행할 SQL
-- ========================================================

-- 기존 테이블 삭제 (재실행 시)
DROP TABLE IF EXISTS post_likes CASCADE;

DROP TABLE IF EXISTS review_likes CASCADE;

DROP TABLE IF EXISTS comments CASCADE;

DROP TABLE IF EXISTS posts CASCADE;

DROP TABLE IF EXISTS reviews CASCADE;

DROP TABLE IF EXISTS users CASCADE;

-- ========================================================
-- 1. users 테이블 (사용자 정보)
-- ========================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 2. reviews 테이블 (영화 리뷰)
-- ========================================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    movie_title VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
    content TEXT,
    recommend VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0
);

CREATE INDEX idx_reviews_movie ON reviews (movie_title);

CREATE INDEX idx_reviews_user ON reviews (user_id);

-- ========================================================
-- 3. posts 테이블 (게시글)
-- ========================================================
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    views INTEGER DEFAULT 0,
    recommend INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0
);

CREATE INDEX idx_posts_user ON posts (user_id);

CREATE INDEX idx_posts_created ON posts (created_at DESC);

-- ========================================================
-- 4. comments 테이블 (게시글 댓글)
-- ========================================================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_post ON comments (post_id);

CREATE INDEX idx_comments_user ON comments (user_id);

-- ========================================================
-- 5. review_likes 테이블 (리뷰 좋아요/싫어요)
-- ========================================================
-- PostgreSQL에서는 ENUM을 별도로 생성
CREATE TYPE like_type AS ENUM ('like', 'dislike');

CREATE TABLE review_likes (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews (id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    like_type like_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (review_id, user_id)
);

CREATE INDEX idx_review_likes_review ON review_likes (review_id);

CREATE INDEX idx_review_likes_user ON review_likes (user_id);

-- ========================================================
-- 6. post_likes 테이블 (게시글 좋아요/싫어요)
-- ========================================================
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    like_type like_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes (post_id);

CREATE INDEX idx_post_likes_user ON post_likes (user_id);

-- ========================================================
-- 샘플 데이터 (선택사항)
-- ========================================================

-- 테스트 사용자 (비밀번호는 bcrypt로 해시된 "1234")
-- INSERT INTO users (username, password) VALUES
-- ('testuser', '$2b$10$YourHashedPasswordHere');

-- ========================================================
-- 완료 확인
-- ========================================================
SELECT 'PostgreSQL 테이블 생성 완료!' as status;