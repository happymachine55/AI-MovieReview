# ⚠️ Vercel 배포 시 브랜치 선택 문제 해결

## 🔴 문제 상황
Vercel에서 프로젝트 생성 시 `supabase-movie` 브랜치가 선택지에 없고 `main` 브랜치만 표시됩니다.

---

## ✅ 해결 방법 (2가지 중 선택)

### 방법 1: GitHub 기본 브랜치 변경 (권장 ⭐)

Vercel은 GitHub의 **기본 브랜치(Default branch)**를 기준으로 작동합니다.

#### 단계:

1. **GitHub 레포지토리 접속**
   - https://github.com/happymachine55/AI-MovieReview

2. **Settings 탭 클릭**
   - 레포지토리 상단 메뉴바에서 "Settings" 클릭

3. **Default branch 변경**
   - "General" 화면에서 "Default branch" 섹션 찾기
   - 현재 `main` 옆의 🔄 (switch) 아이콘 클릭
   - 드롭다운에서 `supabase-movie` 선택
   - "Update" 버튼 클릭
   - 경고창에서 "I understand, update the default branch" 클릭

4. **Vercel로 돌아가기**
   - 브라우저를 새로고침 (F5)
   - 다시 프로젝트 Import 시도
   - 이제 `supabase-movie`가 기본으로 선택됩니다

---

### 방법 2: 일단 main으로 배포 후 변경

GitHub 기본 브랜치를 변경하기 싫다면 이 방법을 사용하세요.

#### 단계:

1. **일단 main 브랜치로 Import 진행**
   - Root Directory: `supabase-MovieReview/frontend`
   - 환경 변수 설정
   - "Deploy" 클릭 (실패해도 괜찮음)

2. **배포 완료 후 Settings 이동**
   - 프로젝트 대시보드 → Settings → Git

3. **Production Branch 변경**
   - "Production Branch" 섹션에서
   - `main` → `supabase-movie`로 변경
   - "Save" 클릭

4. **수동 배포 트리거**
   - Deployments 탭 → "Create Deployment" 버튼
   - Branch: `supabase-movie` 입력
   - "Create Deployment" 클릭

---

## 🎯 추천 방법

**방법 1 (GitHub 기본 브랜치 변경)을 강력히 추천합니다!**

이유:
- ✅ Vercel 설정이 단순해집니다
- ✅ 자동 배포가 올바른 브랜치에서 작동합니다
- ✅ 향후 다른 도구(GitHub Actions 등)도 올바른 브랜치를 사용합니다
- ✅ 팀원이 레포지토리를 clone하면 자동으로 `supabase-movie` 브랜치로 시작합니다

---

## 📝 GitHub 기본 브랜치 변경 스크립트 (참고용)

혹시 Git 명령어로 하고 싶다면:

```bash
# 로컬에서 기본 브랜치 확인
git remote show origin

# GitHub Web에서만 변경 가능 (API 사용 시)
# gh repo edit --default-branch supabase-movie
```

⚠️ **주의:** GitHub의 기본 브랜치는 웹 UI에서만 안전하게 변경할 수 있습니다.

---

## ✅ 변경 후 확인

1. **GitHub에서 확인**
   - 레포지토리 메인 페이지
   - 브랜치 버튼에 `supabase-movie`가 기본으로 표시

2. **Vercel에서 확인**
   - Import 페이지 새로고침
   - `supabase-movie`가 선택 가능해짐

---

## 🔗 다음 단계

기본 브랜치를 변경한 후 **VERCEL_DEPLOY_GUIDE.md**의 "Step 2"부터 계속 진행하세요!

