-- Supabase 프로덕션 데이터 시딩 스크립트

-- 1) pgcrypto 확장 활성화
create extension if not exists pgcrypto;

-- 2) 기존 사용자들의 비밀번호를 SHA-256(password + username) 방식으로 변환
-- 테스트 비밀번호: 1111
update users
set password = encode(digest('1111' || username, 'sha256'), 'hex')
where username in ('user1', 'user2', 'user3');

-- 3) 게시글(posts) 샘플 데이터 삽입
insert into posts (user_id, title, content, created_at) 
select 5, 'Vercel 배포 완료!', '드디어 AI 영화 리뷰 사이트가 배포되었습니다. 🎉', now()
where not exists (select 1 from posts where title = 'Vercel 배포 완료!');

insert into posts (user_id, title, content, created_at) 
select 6, '좋아하는 영화 추천해주세요', '요즘 볼만한 영화 있나요? 추천 부탁드립니다!', now() - interval '2 hours'
where not exists (select 1 from posts where title = '좋아하는 영화 추천해주세요');

insert into posts (user_id, title, content, created_at) 
select 8, 'Minecraft 영화 기대됩니다', '예고편 봤는데 정말 재밌을 것 같아요!', now() - interval '5 hours'
where not exists (select 1 from posts where title = 'Minecraft 영화 기대됩니다');

insert into posts (user_id, title, content, created_at) 
select 5, '이번주 개봉작 정보', '이번주에는 어떤 영화가 개봉하나요?', now() - interval '1 day'
where not exists (select 1 from posts where title = '이번주 개봉작 정보');

insert into posts (user_id, title, content, created_at) 
select 6, '영화관 추천', '분위기 좋은 영화관 추천해주세요', now() - interval '2 days'
where not exists (select 1 from posts where title = '영화관 추천');

-- 4) 영화 리뷰(reviews) 샘플 데이터 삽입
insert into reviews (user_id, movie_title, rating, content, recommend, created_at) 
select 5, '마인크래프트 무비', 8, '예상보다 훨씬 재밌었어요! 게임 팬이라면 꼭 보세요.', '추천', now()
where not exists (select 1 from reviews where user_id = 5 and movie_title = '마인크래프트 무비');

insert into reviews (user_id, movie_title, rating, content, recommend, created_at) 
select 6, '백설공주(실사, 2025)', 4, '원작의 매력을 살리지 못한 것 같아요.', '비추천', now() - interval '3 hours'
where not exists (select 1 from reviews where user_id = 6 and movie_title = '백설공주(실사, 2025)');

insert into reviews (user_id, movie_title, rating, content, recommend, created_at) 
select 8, '블랙백', 9, '액션 신이 정말 멋있었습니다. 강력 추천!', '추천', now() - interval '6 hours'
where not exists (select 1 from reviews where user_id = 8 and movie_title = '블랙백');

insert into reviews (user_id, movie_title, rating, content, recommend, created_at) 
select 5, '미스터로봇', 7, '스릴있는 전개가 인상적이었어요.', '추천', now() - interval '1 day'
where not exists (select 1 from reviews where user_id = 5 and movie_title = '미스터로봇');

insert into reviews (user_id, movie_title, rating, content, recommend, created_at) 
select 6, '워킹맨', 5, '무난하게 볼만한 영화입니다.', '보통', now() - interval '2 days'
where not exists (select 1 from reviews where user_id = 6 and movie_title = '워킹맨');

insert into reviews (user_id, movie_title, rating, content, recommend, created_at) 
select 8, '유니콘의죽음', 7, '독특한 설정이 흥미로웠어요.', '추천', now() - interval '3 days'
where not exists (select 1 from reviews where user_id = 8 and movie_title = '유니콘의죽음');

-- 5) 댓글(comments) 샘플 데이터 삽입
insert into comments (user_id, post_id, content, created_at)
select 6, p.id, '저도 기대되네요!', now()
from posts p
where p.title = 'Vercel 배포 완료!'
and not exists (select 1 from comments c where c.post_id = p.id and c.user_id = 6 and c.content = '저도 기대되네요!');

insert into comments (user_id, post_id, content, created_at)
select 8, p.id, '축하합니다! 👏', now() - interval '30 minutes'
from posts p
where p.title = 'Vercel 배포 완료!'
and not exists (select 1 from comments c where c.post_id = p.id and c.user_id = 8);

insert into comments (user_id, post_id, content, created_at)
select 5, p.id, '저는 "블랙백" 추천드려요!', now() - interval '1 hour'
from posts p
where p.title = '좋아하는 영화 추천해주세요'
and not exists (select 1 from comments c where c.post_id = p.id and c.user_id = 5);

insert into comments (user_id, post_id, content, created_at)
select 6, p.id, '예고편만 봐도 설레네요 ㅎㅎ', now() - interval '4 hours'
from posts p
where p.title = 'Minecraft 영화 기대됩니다'
and not exists (select 1 from comments c where c.post_id = p.id and c.user_id = 6);

insert into comments (user_id, post_id, content, created_at)
select 8, p.id, '오늘 개봉하는 영화 몇 개 있던데요', now() - interval '20 hours'
from posts p
where p.title = '이번주 개봉작 정보'
and not exists (select 1 from comments c where c.post_id = p.id and c.user_id = 8);

-- 6) 피드백(feedbacks) 샘플 데이터 삽입
insert into feedbacks (user_id, content, created_at) 
select 5, '사이트 디자인이 정말 깔끔하네요! 사용하기 편합니다.', now()
where not exists (select 1 from feedbacks where user_id = 5 and content like '%사이트 디자인%');

insert into feedbacks (user_id, content, created_at) 
select 6, '영화 검색 기능이 있으면 좋겠어요.', now() - interval '2 hours'
where not exists (select 1 from feedbacks where user_id = 6 and content like '%영화 검색%');

insert into feedbacks (user_id, content, created_at) 
select 8, 'AI 리뷰 생성 기능이 유용합니다. 감사합니다!', now() - interval '5 hours'
where not exists (select 1 from feedbacks where user_id = 8 and content like '%AI 리뷰%');

insert into feedbacks (user_id, content, created_at) 
select 5, '모바일에서도 잘 보여서 좋아요.', now() - interval '1 day'
where not exists (select 1 from feedbacks where user_id = 5 and content like '%모바일%');

-- 7) 결과 확인
select 
    (select count(*) from users) as users_count,
    (select count(*) from posts) as posts_count,
    (select count(*) from reviews) as reviews_count,
    (select count(*) from comments) as comments_count,
    (select count(*) from feedbacks) as feedbacks_count;
