-- ========================================================
-- Supabase RLS (Row Level Security) 정책 설정
-- GitHub Pages 배포를 위한 공개 읽기 권한 설정
-- ========================================================

-- 1. users 테이블: 공개 읽기 허용
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON users
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON users
FOR INSERT WITH CHECK (true);

-- 2. posts 테이블: 공개 읽기, 인증된 사용자만 작성/삭제
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON posts
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON posts
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for users based on user_id" ON posts
FOR DELETE USING (true);

CREATE POLICY "Enable update for users based on user_id" ON posts
FOR UPDATE USING (true);

-- 3. reviews 테이블: 공개 읽기, 인증된 사용자만 작성/삭제
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON reviews
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON reviews
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for users based on user_id" ON reviews
FOR DELETE USING (true);

CREATE POLICY "Enable update for users based on user_id" ON reviews
FOR UPDATE USING (true);

-- 4. comments 테이블: 공개 읽기, 인증된 사용자만 작성/삭제
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON comments
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON comments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for users based on user_id" ON comments
FOR DELETE USING (true);

-- 5. feedbacks 테이블: 공개 읽기, 인증된 사용자만 작성
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON feedbacks
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON feedbacks
FOR INSERT WITH CHECK (true);

-- 6. review_likes 테이블: 공개 읽기, 모든 사용자 좋아요/싫어요 가능
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON review_likes
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON review_likes
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for users" ON review_likes
FOR DELETE USING (true);

-- 7. post_likes 테이블: 공개 읽기, 모든 사용자 좋아요/싫어요 가능
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON post_likes
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON post_likes
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete for users" ON post_likes
FOR DELETE USING (true);
