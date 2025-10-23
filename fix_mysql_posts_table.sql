-- MySQL posts 테이블에 누락된 컬럼 추가

-- views 컬럼 추가 (조회수)
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS views INT DEFAULT 0 AFTER content;

-- recommend 컬럼 추가 (추천 수)
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS recommend INT DEFAULT 0 AFTER views;

-- 기존 데이터에 기본값 설정
UPDATE posts SET views = 0 WHERE views IS NULL;

UPDATE posts SET recommend = 0 WHERE recommend IS NULL;

-- 확인
DESCRIBE posts;

SELECT * FROM posts LIMIT 5;