# Vercel 배포 가이드 (공식 문서 기반)

## 📋 Vercel 작동 방식

### 1. **프로젝트 = Git 레포지토리 연결**
- 하나의 Vercel 프로젝트는 **하나의 Git 레포지토리**에 연결됩니다
- 레포지토리 내의 **특정 디렉토리(frontend/)**를 지정할 수 있습니다

### 2. **Production Branch 설정**
Vercel은 자동으로 다음 순서로 Production Branch를 찾습니다:
1. `main` 브랜치 (최우선)
2. `master` 브랜치
3. Git 레포지토리의 기본 브랜치

현재 우리는 `supabase-movie` 브랜치를 사용 중이므로 **수동 설정이 필요**합니다.

### 3. **자동 배포 시스템**
- **Production 배포**: Production Branch에 push/merge할 때마다 자동 배포
- **Preview 배포**: 다른 브랜치에 push하면 Preview 환경으로 배포
- 각 배포마다 고유한 URL이 생성됩니다

---

## 🚀 단계별 배포 방법

### Step 1: Vercel 계정 생성 및 GitHub 연결

1. **Vercel 회원가입**
   - https://vercel.com/signup 접속
   - "Continue with GitHub" 선택
   - GitHub 계정으로 로그인

2. **GitHub 연동 승인**
   - Vercel이 GitHub 레포지토리에 접근할 수 있도록 권한 승인

---

### Step 2: 새 프로젝트 생성

1. **Vercel 대시보드에서 "Add New..." 버튼 클릭**
   - 우측 상단 "Add New..." → "Project" 선택

2. **GitHub 레포지토리 선택**
   - "Import Git Repository" 섹션에서 `happymachine55/AI-MovieReview` 찾기
   - "Import" 버튼 클릭

---

### Step 3: 프로젝트 설정 (중요!)

배포 전 설정 화면에서 다음을 구성합니다:

#### 3-1. 기본 설정
```
Project Name: ai-moviereview (또는 원하는 이름)
Framework Preset: Other (또는 "Vanilla JavaScript")
Root Directory: supabase-MovieReview/frontend
```

**⚠️ 중요: Root Directory 설정**
- "Root Directory" 옆의 "Edit" 버튼 클릭
- `supabase-MovieReview/frontend` 입력
- 이렇게 하면 frontend 폴더만 배포됩니다

#### 3-2. Build & Output Settings
```
Build Command: (비워두기 또는 "echo 'No build needed'")
Output Directory: . (현재 디렉토리)
Install Command: (비워두기)
```

Vanilla JavaScript 프로젝트이므로 별도의 빌드가 필요 없습니다.

#### 3-3. Environment Variables
다음 환경 변수를 추가합니다:

```
SUPABASE_URL = https://iwdivytuvwlpvzfnbigs.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZGl2eXR1dndscHZ6Zm5iaWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTU1NTAsImV4cCI6MjA3ODkzMTU1MH0.v6ewZZhPEnnzGjcgqH0SVGgYGqAFg4ZGIsZ4Rjx0a9c
```

---

### Step 4: Production Branch 설정

**초기 배포 후 Production Branch를 변경해야 합니다:**

1. **프로젝트 대시보드로 이동**
   - 배포 완료 후 "Go to Project" 클릭

2. **Settings → Git 메뉴**
   - 좌측 메뉴에서 "Settings" 클릭
   - "Git" 탭 선택

3. **Production Branch 변경**
   - "Production Branch" 섹션 찾기
   - 현재 `main`으로 되어 있을 것
   - `supabase-movie`로 변경
   - "Save" 버튼 클릭

4. **수동 재배포**
   - "Deployments" 탭으로 이동
   - "Create Deployment" 버튼 클릭
   - Branch name: `supabase-movie` 입력
   - "Create Deployment" 클릭

---

### Step 5: 배포 확인

1. **배포 진행 상황 확인**
   - "Deployments" 탭에서 실시간 로그 확인
   - "Building..." → "Deploying..." → "Ready" 순서로 진행

2. **배포된 사이트 접속**
   - 배포 완료 후 생성된 URL 클릭 (예: `https://ai-moviereview.vercel.app`)
   - 또는 "Visit" 버튼 클릭

3. **테스트**
   - 로그인 기능 테스트
   - 회원가입 기능 테스트
   - 게시글 작성 테스트

---

## 🔄 자동 배포 설정 완료 후

이제부터는 `supabase-movie` 브랜치에 push할 때마다 자동으로 배포됩니다:

```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin supabase-movie
```

push 후 1-2분 내에 Vercel이 자동으로:
1. 새 커밋 감지
2. 빌드 실행
3. 배포 완료
4. 이메일/알림 발송

---

## 📝 추가 설정 (선택사항)

### Custom Domain 연결
1. Settings → Domains
2. "Add" 버튼 클릭
3. 도메인 입력 (예: `moviereview.com`)
4. DNS 설정 가이드 따라하기

### Preview Deployments
- 다른 브랜치(예: `dev`)에 push하면 Preview URL 자동 생성
- PR(Pull Request)마다 고유한 Preview 환경 제공

### Deploy Hooks (선택)
- Webhook URL로 수동 배포 트리거 가능
- Settings → Git → Deploy Hooks에서 생성

---

## ⚠️ 주의사항

1. **Root Directory 설정 필수**
   - 설정하지 않으면 전체 레포지토리를 배포하려고 시도
   - `supabase-MovieReview/frontend`로 정확히 입력

2. **Production Branch 변경 필수**
   - 초기에는 `main` 브랜치로 설정됨
   - `supabase-movie`로 반드시 변경

3. **환경 변수 확인**
   - Supabase URL과 Key가 정확한지 확인
   - frontend/config.js의 값과 동일해야 함

4. **CORS 설정 (Supabase)**
   - Vercel 배포 URL을 Supabase에서 허용해야 할 수 있음
   - Supabase Dashboard → Settings → API에서 설정

---

## 🐛 문제 해결

### 배포 실패 시
1. Vercel 대시보드의 "Deployments" → 실패한 배포 클릭
2. "Build Logs" 확인
3. 오류 메시지 확인

### 404 오류 발생 시
1. Root Directory가 올바른지 확인
2. index.html이 frontend 폴더에 있는지 확인

### API 연결 실패 시
1. 브라우저 개발자 도구(F12) → Console 탭 확인
2. CORS 오류인 경우 Supabase 설정 확인
3. 환경 변수가 올바른지 확인

---

## 📚 참고 링크

- [Vercel 공식 문서 - Git 배포](https://vercel.com/docs/git)
- [Vercel 공식 문서 - Production Branch](https://vercel.com/docs/git#production-branch)
- [Vercel 대시보드](https://vercel.com/dashboard)

---

## ✅ 체크리스트

배포 전 확인사항:
- [ ] Vercel 계정 생성 완료
- [ ] GitHub 연동 완료
- [ ] Root Directory를 `supabase-MovieReview/frontend`로 설정
- [ ] 환경 변수 추가 (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] 초기 배포 완료
- [ ] Production Branch를 `supabase-movie`로 변경
- [ ] 수동 재배포 실행
- [ ] 배포된 사이트 접속 및 테스트
- [ ] 자동 배포 작동 확인 (새 커밋 push)

