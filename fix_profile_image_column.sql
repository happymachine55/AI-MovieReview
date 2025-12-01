-- profile_image 컬럼을 VARCHAR(255)에서 TEXT로 변경
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE users 
ALTER COLUMN profile_image TYPE TEXT;

-- 기존 데이터 확인
SELECT id, username, 
       CASE 
           WHEN profile_image IS NULL THEN 'NULL'
           WHEN LENGTH(profile_image) > 255 THEN '길이 초과: ' || LENGTH(profile_image) || '자'
           ELSE '정상: ' || LENGTH(profile_image) || '자'
       END as image_status
FROM users;
