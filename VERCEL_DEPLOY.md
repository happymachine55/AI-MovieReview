# Vercel 배포 가이드 (최고 추천!)

## 🚀 Vercel이 최고인 이유

- ✅ **완벽한 SPA 지원** - 404 에러 자동 해결
- ✅ 무제한 대역폭 (100GB/월)
- ✅ 초고속 글로벌 CDN
- ✅ 자동 HTTPS
- ✅ GitHub 푸시 시 자동 배포
- ✅ 무료 플랜으로 충분

---

## 방법 1: Vercel 웹사이트에서 배포 (가장 쉬움!)

### 1단계: GitHub에 코드 푸시

```bash
git add vercel.json netlify.toml frontend/_redirects
git commit -m "Add Vercel/Netlify deployment configs"
git push origin supabase-movie
```

### 2단계: Vercel 계정 생성 및 배포

1. **Vercel 접속**: https://vercel.com
2. **Sign up with GitHub** 클릭
3. **New Project** 클릭
4. **Import Git Repository** - `happymachine55/AI-MovieReview` 선택
5. **Configure Project** 설정:
   ```
   Framework Preset: Other
   Root Directory: frontend
   Build Command: (비워두기)
   Output Directory: . (점 하나)
   ```
6. **Environment Variables** (필요 없음 - 이미 config.js에 있음)
7. **Deploy** 클릭!

### 3단계: 배포 완료! 🎉

- 배포 URL: `https://your-project.vercel.app`
- 자동으로 HTTPS, CDN, SPA 라우팅 모두 적용됨

---

## 방법 2: Vercel CLI로 배포

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 배포
cd frontend
vercel

# 질문에 답변:
# - Set up and deploy? Y
# - Which scope? (본인 계정 선택)
# - Link to existing project? N
# - What's your project's name? ai-moviereview
# - In which directory is your code located? ./
# - Want to override settings? N

# 4. 프로덕션 배포
vercel --prod
```

---

## 방법 3: GitHub Actions 자동 배포

`.github/workflows/deploy.yml` 파일 생성 (이미 만들어둠):

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [supabase-movie]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

---

## 🎯 배포 후 확인 사항

### 1. SPA 라우팅 테스트

- ✅ 메인 페이지: `https://your-app.vercel.app`
- ✅ 영화 상세: `https://your-app.vercel.app?movieId=1`
- ✅ 갤러리: `https://your-app.vercel.app?page=gallery`
- ✅ **새로고침해도 404 에러가 나지 않음!**

### 2. Supabase 연결 확인

- 브라우저 개발자 도구(F12) > Console 탭 확인
- Network 탭에서 API 호출 확인
- 게시글/리뷰가 정상적으로 표시되는지 확인

### 3. 로그인/회원가입 테스트

---

## 🆚 Vercel vs GitHub Pages 비교

| 기능          | GitHub Pages      | Vercel         |
| ------------- | ----------------- | -------------- |
| SPA 라우팅    | ❌ 수동 설정 필요 | ✅ 자동 지원   |
| 404 에러      | ❌ 발생           | ✅ 자동 해결   |
| 배포 속도     | ⚠️ 느림 (5-10분)  | ✅ 빠름 (30초) |
| CDN 속도      | ⚠️ 보통           | ✅ 매우 빠름   |
| 커스텀 도메인 | ✅ 지원           | ✅ 지원        |
| HTTPS         | ✅ 자동           | ✅ 자동        |
| 환경 변수     | ❌ 불가           | ✅ 가능        |
| 프리뷰 배포   | ❌ 없음           | ✅ PR마다 자동 |

---

## 🔧 문제 해결

### 404 에러가 계속 나는 경우

1. Vercel 대시보드 > Settings > General
2. Root Directory가 `frontend`로 설정되어 있는지 확인
3. Build Command가 비어있는지 확인

### API 호출이 안 되는 경우

1. `frontend/config.js` 확인:

   ```javascript
   const USE_LOCAL_API = false; // 반드시 false여야 함
   ```

2. Supabase RLS 정책 설정:
   - Supabase 대시보드 > SQL Editor
   - `enable_rls_policies.sql` 실행

### CORS 에러가 나는 경우

- Supabase Edge Functions에 이미 CORS 헤더가 있으므로 문제 없음
- 혹시 모르니 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

---

## 📱 모바일 테스트

Vercel은 배포 즉시 모바일 최적화된 URL 제공:

- 모바일에서도 빠르게 작동
- PWA(Progressive Web App) 설정 가능

---

## 💰 비용

**완전 무료!**

- 무료 플랜으로 충분 (100GB 대역폭/월)
- 학생 프로젝트에 최적

---

## 🎉 완료!

이제 GitHub Pages의 404 에러 없이 완벽하게 작동하는 사이트를 가지게 되었습니다!

**배포 URL 예시:**

- https://ai-moviereview.vercel.app
- https://ai-moviereview-happymachine55.vercel.app

**다음 단계:**

1. Vercel에 배포
2. Supabase RLS 정책 설정 (`enable_rls_policies.sql` 실행)
3. 모든 기능 테스트
4. 완성! 🎊
