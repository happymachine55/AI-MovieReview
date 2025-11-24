-- Row Level Security (RLS) 활성화
-- 모든 테이블에 RLS를 켜고, service_role로 모든 작업 허용

-- 1. 모든 테이블에 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 2. service_role은 모든 작업 허용 (Edge Functions가 사용)
-- users 테이블
CREATE POLICY "Service role can do anything on users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- posts 테이블
CREATE POLICY "Service role can do anything on posts"
ON public.posts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- reviews 테이블
CREATE POLICY "Service role can do anything on reviews"
ON public.reviews
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- comments 테이블
CREATE POLICY "Service role can do anything on comments"
ON public.comments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- feedbacks 테이블
CREATE POLICY "Service role can do anything on feedbacks"
ON public.feedbacks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- review_likes 테이블
CREATE POLICY "Service role can do anything on review_likes"
ON public.review_likes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- post_likes 테이블
CREATE POLICY "Service role can do anything on post_likes"
ON public.post_likes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. anon 사용자는 읽기만 허용 (선택사항)
CREATE POLICY "Anyone can read users"
ON public.users
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anyone can read posts"
ON public.posts
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anyone can read comments"
ON public.comments
FOR SELECT
TO anon
USING (true);
