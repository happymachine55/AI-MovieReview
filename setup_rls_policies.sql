-- ==============================================
-- Supabase RLS 정책 설정 (한번에 실행)
-- ==============================================

-- 1️⃣ Storage: profiles 버킷 RLS 정책
-- 기존 정책이 있다면 삭제 후 재생성

DROP POLICY IF EXISTS "Allow public uploads to profiles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from profiles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile images" ON storage.objects;

-- 모든 사용자가 프로필 이미지를 업로드할 수 있도록 허용
CREATE POLICY "Allow public uploads to profiles bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'profiles');

-- 모든 사용자가 프로필 이미지를 조회할 수 있도록 허용
CREATE POLICY "Allow public reads from profiles bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- 사용자가 자신의 프로필 이미지를 업데이트할 수 있도록 허용
CREATE POLICY "Allow users to update their own profile images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'profiles')
WITH CHECK (bucket_id = 'profiles');

-- 사용자가 자신의 프로필 이미지를 삭제할 수 있도록 허용
CREATE POLICY "Allow users to delete their own profile images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'profiles');


-- 2️⃣ users 테이블 RLS 정책
-- 기존 정책이 있다면 삭제 후 재생성

DROP POLICY IF EXISTS "Allow public to read users" ON public.users;
DROP POLICY IF EXISTS "Allow public to insert users" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 users 테이블을 조회할 수 있도록 허용 (아이디 중복 체크용)
CREATE POLICY "Allow public to read users"
ON public.users
FOR SELECT
TO public
USING (true);

-- 회원가입을 위해 누구나 users 테이블에 insert 가능
CREATE POLICY "Allow public to insert users"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- 사용자가 자신의 프로필만 수정할 수 있도록 허용
CREATE POLICY "Allow users to update their own profile"
ON public.users
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);


-- 3️⃣ 다른 테이블들도 RLS 설정 (reviews, posts, comments 등)

-- reviews 테이블
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow authenticated to insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow users to delete their own reviews" ON public.reviews;

CREATE POLICY "Allow public to read reviews"
ON public.reviews FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow users to update reviews" ON public.reviews;

CREATE POLICY "Allow authenticated to insert reviews"
ON public.reviews FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow users to update reviews"
ON public.reviews FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to delete their own reviews"
ON public.reviews FOR DELETE TO public USING (true);


-- posts 테이블
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to read posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated to insert posts" ON public.posts;
DROP POLICY IF EXISTS "Allow users to delete their own posts" ON public.posts;

CREATE POLICY "Allow public to read posts"
ON public.posts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow users to update posts" ON public.posts;

CREATE POLICY "Allow authenticated to insert posts"
ON public.posts FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow users to update posts"
ON public.posts FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to delete their own posts"
ON public.posts FOR DELETE TO public USING (true);


-- comments 테이블
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to read comments" ON public.comments;
DROP POLICY IF EXISTS "Allow authenticated to insert comments" ON public.comments;
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.comments;

CREATE POLICY "Allow public to read comments"
ON public.comments FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow users to update comments" ON public.comments;

CREATE POLICY "Allow authenticated to insert comments"
ON public.comments FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow users to update comments"
ON public.comments FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to delete their own comments"
ON public.comments FOR DELETE TO public USING (true);


-- review_likes 테이블
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to manage review likes" ON public.review_likes;

CREATE POLICY "Allow public to manage review likes"
ON public.review_likes FOR ALL TO public USING (true) WITH CHECK (true);


-- post_likes 테이블
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to manage post likes" ON public.post_likes;

CREATE POLICY "Allow public to manage post likes"
ON public.post_likes FOR ALL TO public USING (true) WITH CHECK (true);


-- feedbacks 테이블 (있다면)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feedbacks') THEN
        ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public to manage feedbacks" ON public.feedbacks;
        
        CREATE POLICY "Allow public to manage feedbacks"
        ON public.feedbacks FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
END $$;


-- ==============================================
-- 확인 쿼리
-- ==============================================

-- 현재 설정된 모든 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' OR schemaname = 'storage'
ORDER BY schemaname, tablename, policyname;
