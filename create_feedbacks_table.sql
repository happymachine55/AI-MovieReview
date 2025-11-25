-- 로컬 PostgreSQL에 feedbacks 테이블 생성

-- feedbacks 테이블
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created_at DESC);

-- 확인
SELECT 'feedbacks 테이블 생성 완료!' as message;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'feedbacks';
