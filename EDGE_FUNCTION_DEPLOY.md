# Supabase Edge Function 배포 가이드

## 1️⃣ Supabase Dashboard에서 Edge Function 수동 배포

### 방법 A: Dashboard에서 직접 배포 (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택: `iwdivytuvwlpvzfnbigs`

2. **Edge Functions 메뉴로 이동**
   - 좌측 메뉴 → **Edge Functions** 클릭

3. **ai-review 함수 생성/업데이트**
   - "Create a new function" 또는 기존 `ai-review` 선택
   - 함수 이름: `ai-review`
   - 코드 에디터에 다음 파일 내용 복사:
     - `supabase/functions/ai-review/index.ts` 전체 내용

4. **환경 변수 설정**
   - Settings → Environment variables
   - 새 변수 추가:
     ```
     이름: GEMINI_API_KEY
     값: AIzaSyC0vNEDRhj8vQ6lNfB-iW1D6YIZy36oFNE
     ```

5. **Deploy 버튼 클릭**

---

## 2️⃣ Supabase CLI로 배포 (선택)

### CLI 설치 (PowerShell)
```powershell
# Scoop 사용 (권장)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 또는 npm 사용
npm install -g supabase
```

### 프로젝트 연결
```powershell
cd "c:\Users\user\Documents\캡스톤디자인과제\movie_exercise2.13\supabase-MovieReview"

# Supabase 프로젝트 연결
supabase link --project-ref iwdivytuvwlpvzfnbigs
```

### 환경 변수 설정
```powershell
supabase secrets set GEMINI_API_KEY=AIzaSyC0vNEDRhj8vQ6lNfB-iW1D6YIZy36oFNE
```

### 함수 배포
```powershell
supabase functions deploy ai-review
```

---

## 3️⃣ RLS 정책 적용

Supabase Dashboard → SQL Editor에서 다음 실행:

```sql
-- UPDATE 정책 추가
DROP POLICY IF EXISTS "Allow users to update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow users to update posts" ON public.posts;
DROP POLICY IF EXISTS "Allow users to update comments" ON public.comments;

CREATE POLICY "Allow users to update reviews"
ON public.reviews FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to update posts"
ON public.posts FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to update comments"
ON public.comments FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 확인
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND cmd = 'UPDATE'
ORDER BY tablename;
```

---

## 4️⃣ 테스트

1. **Vercel 재배포 대기** (1-2분)
   - https://vercel.com/dashboard
   - ai-movie-review-delta 프로젝트에서 최신 배포 확인

2. **브라우저 캐시 완전 초기화**
   ```
   F12 → Application → Clear storage → Clear site data
   또는
   Ctrl + Shift + Delete → 쿠키 및 캐시 삭제
   ```

3. **사이트 접속 후 테스트**
   - AI 리뷰 모달 열기
   - 감정/평점/추천 선택
   - "AI 리뷰 생성" 클릭
   - 3개의 선택지가 나타나는지 확인

4. **개발자 도구에서 확인**
   - Network 탭에서 `ai-review` 요청 확인
   - Status: 200
   - Response: `{"success": true, "reviews": [...]}`

---

## 🔍 트러블슈팅

### 401 Unauthorized
- Authorization 헤더가 추가되었는지 확인 (이미 수정 완료)
- `script.js?v=3`가 로드되는지 확인

### 500 Internal Server Error
- Supabase Dashboard → Edge Functions → ai-review → Logs 확인
- Gemini API 키가 올바른지 확인
- 환경 변수 `GEMINI_API_KEY`가 설정되었는지 확인

### CORS Error
- Edge Function에 corsHeaders가 설정되어 있음 (이미 완료)

---

## ✅ 완료 체크리스트

- [ ] Supabase Edge Function `ai-review` 배포
- [ ] 환경 변수 `GEMINI_API_KEY` 설정
- [ ] RLS UPDATE 정책 실행
- [ ] Vercel 재배포 확인
- [ ] 브라우저 캐시 초기화
- [ ] AI 리뷰 3개 선택지 표시 테스트
