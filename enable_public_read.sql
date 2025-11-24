-- ========================================
-- 공개 읽기 권한 설정 (anon key로 읽기 가능)
-- ========================================

-- 1. users 테이블: 모든 사용자가 읽기 가능
DROP POLICY IF EXISTS "Allow public read access" ON users;
CREATE POLICY "Allow public read access" ON users
FOR SELECT TO anon
USING (true);

-- 2. posts 테이블: 모든 사용자가 읽기 가능
DROP POLICY IF EXISTS "Allow public read access" ON posts;
CREATE POLICY "Allow public read access" ON posts
FOR SELECT TO anon
USING (true);

-- 3. reviews 테이블: 모든 사용자가 읽기 가능
DROP POLICY IF EXISTS "Allow public read access" ON reviews;
CREATE POLICY "Allow public read access" ON reviews
FOR SELECT TO anon
USING (true);

-- 4. comments 테이블: 모든 사용자가 읽기 가능
DROP POLICY IF EXISTS "Allow public read access" ON comments;
FOR SELECT TO anon
USING (true);

-- 5. likes 테이블: 모든 사용자가 읽기 가능
DROP POLICY IF EXISTS "Allow public read access" ON likes;
CREATE POLICY "Allow public read access" ON likes
FOR SELECT TO anon
USING (true);

-- 6. feedbacks 테이블: 모든 사용자가 읽기 가능
DROP POLICY IF EXISTS "Allow public read access" ON feedbacks;
CREATE POLICY "Allow public read access" ON feedbacks
FOR SELECT TO anon
USING (true);

-- ========================================
-- 쓰기 권한도 anon에게 부여 (임시)
-- ========================================

-- posts 테이블 쓰기 권한
DROP POLICY IF EXISTS "Allow public insert" ON posts;
CREATE POLICY "Allow public insert" ON posts
FOR INSERT TO anon
WITH CHECK (true);

-- reviews 테이블 쓰기 권한
DROP POLICY IF EXISTS "Allow public insert" ON reviews;
CREATE POLICY "Allow public insert" ON reviews
FOR INSERT TO anon
WITH CHECK (true);

-- comments 테이블 쓰기 권한
DROP POLICY IF EXISTS "Allow public insert" ON comments;
CREATE POLICY "Allow public insert" ON comments
FOR INSERT TO anon
WITH CHECK (true);

-- likes 테이블 쓰기 권한
DROP POLICY IF EXISTS "Allow public insert" ON likes;
CREATE POLICY "Allow public insert" ON likes
FOR INSERT TO anon
WITH CHECK (true);

-- feedbacks 테이블 쓰기 권한
DROP POLICY IF EXISTS "Allow public insert" ON feedbacks;
CREATE POLICY "Allow public insert" ON feedbacks
FOR INSERT TO anon
WITH CHECK (true);

-- users 테이블 쓰기 권한 (회원가입용)
DROP POLICY IF EXISTS "Allow public insert" ON users;
CREATE POLICY "Allow public insert" ON users
FOR INSERT TO anon
WITH CHECK (true);
