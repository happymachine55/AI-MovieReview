-- ==============================================
-- ID 시퀀스 초기화 및 중복 데이터 정리
-- ==============================================

-- 1. 현재 users 테이블 상태 확인
SELECT id, username, created_at FROM users ORDER BY id;

-- 2. 현재 시퀀스 값 확인
SELECT last_value FROM users_id_seq;

-- 3. 시퀀스 값을 현재 최대 ID + 1로 재설정
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);

-- 4. 다시 확인
SELECT last_value FROM users_id_seq;

-- ==============================================
-- (선택사항) 테스트 데이터 삭제 - 주의: 실제 사용자도 삭제됨!
-- ==============================================

-- 특정 테스트 사용자만 삭제하려면:
-- DELETE FROM users WHERE username IN ('user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8');

-- 모든 데이터를 삭제하고 처음부터 시작하려면 (주의!):
-- TRUNCATE TABLE users CASCADE;
-- SELECT setval('users_id_seq', 1, false);
