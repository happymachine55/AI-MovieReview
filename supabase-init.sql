-- Supabase(Postgres)용 DB 초기화 스크립트
-- users 테이블에 profile_image 칼럼 추가
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);

-- feedbacks 테이블 생성
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created_at DESC);

-- (필요시) posts, reviews, comments 등 기존 테이블이 없다면 아래도 실행
-- ... (init_postgres.sql에서 복사)
