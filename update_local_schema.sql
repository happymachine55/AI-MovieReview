-- 로컬 PostgreSQL 스키마를 Supabase와 동일하게 업데이트

-- users 테이블에 profile_image 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- posts 테이블에 movie_title 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS movie_title VARCHAR(255);

-- 확인
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'posts';
