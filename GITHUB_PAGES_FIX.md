# GitHub Pages 배포 문제 해결 가이드

## 🐛 발견된 문제점

1. **404 에러** - 새로고침 시 페이지를 찾을 수 없음
2. **데이터 로드 실패** - 게시글, 리뷰가 표시되지 않음
3. **로그인 불가** - 로그인 기능이 작동하지 않음

## ✅ 해결 방법

### 1단계: Supabase RLS (보안 정책) 설정

#### Supabase 대시보드에서 실행

1. **Supabase 대시보드 접속**: https://supabase.com/dashboard/project/iwdivytuvwlpvzfnbigs
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. `enable_rls_policies.sql` 파일 내용 전체 복사
4. SQL Editor에 붙여넣고 **RUN** 클릭
5. ✅ 성공 메시지 확인

이렇게 하면 모든 사용자가 데이터를 읽을 수 있게 됩니다.

---

### 2단계: Edge Functions 배포 확인

#### Supabase CLI로 Edge Functions 배포

```bash
# 1. Supabase 로그인
npx supabase login

# 2. 프로젝트 연결
npx supabase link --project-ref iwdivytuvwlpvzfnbigs

# 3. 모든 Edge Functions 배포
npx supabase functions deploy ai-review
npx supabase functions deploy login
npx supabase functions deploy register
npx supabase functions deploy posts
npx supabase functions deploy reviews
npx supabase functions deploy comments
npx supabase functions deploy likes
npx supabase functions deploy feedbacks

# 4. 환경 변수 설정
npx supabase secrets set GEMINI_API_KEY=AIzaSyCO-jsOp7AOYLcVoOZ3nH2IMo2oIf2NCtQ
```

#### Edge Functions 배포 상태 확인

Supabase 대시보드 > **Edge Functions** 메뉴에서 다음 함수들이 모두 배포되어 있는지 확인:

- ✅ ai-review
- ✅ login
- ✅ register
- ✅ posts
- ✅ reviews
- ✅ comments
- ✅ likes
- ✅ feedbacks

---

### 3단계: GitHub Pages 설정

#### GitHub 저장소 설정 확인

1. GitHub 저장소: `https://github.com/happymachine55/AI-MovieReview`
2. **Settings** > **Pages** 이동
3. **Branch** 설정:
   - Branch: `supabase-movie`
   - Folder: `/frontend` 또는 `/ (root)`
4. **Save** 클릭

#### 404.html 파일 추가 확인

`frontend/404.html` 파일이 생성되었는지 확인하고, GitHub에 푸시:

```bash
cd c:\Users\user\Documents\캡스톤디자인과제\movie_exercise2.13\supabase-MovieReview
git add frontend/404.html
git add enable_rls_policies.sql
git commit -m "Fix: GitHub Pages 404 에러 및 RLS 정책 추가"
git push origin supabase-movie
```

---

### 4단계: 배포 확인

#### 1. GitHub Pages URL 확인

- 예상 URL: `https://happymachine55.github.io/AI-MovieReview/`
- GitHub > Settings > Pages에서 URL 확인

#### 2. 브라우저 개발자 도구로 확인

1. 사이트 접속 후 `F12` 키 눌러 개발자 도구 열기
2. **Console** 탭에서 에러 확인
3. **Network** 탭에서 API 호출 상태 확인

#### 예상되는 에러와 해결

| 에러 메시지               | 원인                  | 해결 방법                                |
| ------------------------- | --------------------- | ---------------------------------------- |
| `Failed to fetch`         | CORS 에러             | Edge Functions에 CORS 헤더가 있는지 확인 |
| `401 Unauthorized`        | RLS 정책 미설정       | 1단계 RLS 정책 재실행                    |
| `404 Not Found`           | Edge Functions 미배포 | 2단계 Edge Functions 배포                |
| `anonymous key not valid` | API 키 오류           | config.js의 anonKey 확인                 |

---

## 🔍 문제 진단 체크리스트

### ✅ Supabase 설정

- [ ] RLS 정책이 모든 테이블에 적용되었는가?
- [ ] Edge Functions이 모두 배포되었는가?
- [ ] 환경 변수 `GEMINI_API_KEY`가 설정되었는가?

### ✅ GitHub Pages 설정

- [ ] GitHub Pages가 활성화되었는가?
- [ ] 올바른 브랜치(`supabase-movie`)와 폴더가 선택되었는가?
- [ ] `404.html` 파일이 푸시되었는가?

### ✅ 코드 설정

- [ ] `config.js`의 Supabase URL과 anon key가 올바른가?
- [ ] `USE_LOCAL_API`가 `false`로 설정되어 있는가?

---

## 🚀 테스트 시나리오

1. **메인 페이지 접속**: 영화 목록이 표시되는가?
2. **갤러리 페이지**: 게시글이 표시되는가?
3. **로그인**: 로그인이 성공하는가? (비밀번호는 현재 검증 생략됨)
4. **게시글 작성**: 로그인 후 게시글 작성이 가능한가?
5. **새로고침**: 페이지 새로고침 시 404 에러가 나지 않는가?

---

## 📞 문제가 계속되면

1. **브라우저 콘솔 에러 메시지** 복사
2. **Network 탭**에서 실패한 API 요청 확인
3. **Supabase 로그** 확인: Dashboard > Logs > Edge Functions

---

## ⚠️ 알려진 제한사항

### 현재 구현된 기능

- ✅ 게시글/리뷰 읽기
- ✅ 회원가입
- ⚠️ 로그인 (비밀번호 검증 생략 - 보안 취약)

### 개선 필요 사항

- 🔒 로그인 시 Edge Function을 통한 bcrypt 비밀번호 검증 추가
- 📸 프로필 이미지 업로드 (Supabase Storage 연동)
- 🔐 JWT 토큰 기반 인증으로 전환
