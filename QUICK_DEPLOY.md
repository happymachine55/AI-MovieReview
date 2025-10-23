# 🚀 Render 배포 빠른 가이드

## 📋 사전 준비 (로컬 환경)

- ✅ Node.js 설치됨
- ✅ 프로젝트가 GitHub에 푸시됨
- ✅ `.env` 파일 준비됨

**불필요한 것:**

- ❌ PostgreSQL 로컬 설치
- ❌ DBeaver 설치
- ❌ psql 클라이언트

---

## 🎯 배포 3단계

### 1️⃣ Render PostgreSQL 생성

1. https://dashboard.render.com 접속
2. **"New +"** → **"PostgreSQL"**
3. 설정:
   - Name: `moviereview-db`
   - Database: `gallery_movie`
   - Region: `Singapore`
   - Version: `15` (추천!)
   - Plan: `Free`
4. **"Create Database"** 클릭
5. **"Info"** 탭에서 **Internal Database URL** 복사

---

### 2️⃣ 테이블 생성 (로컬에서 실행)

1. **.env 파일에 추가:**

   ```env
   POSTGRES_URL=<복사한 Internal Database URL>
   ```

2. **테이블 생성 스크립트 실행:**

   ```bash
   node create_tables.js
   ```

3. **성공 메시지 확인:**
   ```
   ✨ PostgreSQL 테이블 생성 완료!
   ```

---

### 3️⃣ Render Web Service 배포

1. Render 대시보드 → **"New +"** → **"Web Service"**
2. GitHub 저장소 연결: `happymachine55/AI-MovieReview`
3. 설정:

   - Name: `ai-moviereview`
   - Region: `Singapore`
   - Branch: `main`
   - Runtime: `Node`
   - Build: `npm install`
   - Start: `node app.js`
   - Plan: `Free`

4. **환경 변수 설정:**

   ```env
   DATABASE_URL=<Step 1에서 복사한 Internal Database URL>
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=production
   ```

5. **"Create Web Service"** 클릭

---

## ✅ 배포 완료!

**URL 확인:**

- `https://ai-moviereview.onrender.com`
- 첫 로딩: 30초~1분 소요 (슬립 모드)

---

## 🔄 데이터 동기화 (로컬 MySQL → Render PostgreSQL)

### 테이블 구조 + 데이터 모두 동기화:

```bash
node sync_mysql_to_postgres.js
```

### 데이터만 동기화:

```bash
node migrate_to_postgres.js
```

---

## 📚 상세 가이드

- **전체 배포 가이드**: `DEPLOYMENT_GUIDE.md`
- **데이터 동기화**: `DATA_SYNC_GUIDE.md`
- **Render 상세**: `RENDER_DEPLOY.md`

---

## 💡 핵심 포인트

1. ✅ **PostgreSQL 설치 불필요** - Node.js 스크립트만 사용
2. ✅ **DBeaver 불필요** - CLI로 모든 작업 가능
3. ✅ **자동화** - 스크립트로 반복 가능
4. ✅ **완전 무료** - Render Free 플랜 (750시간/월)

---

## 🐛 문제 해결

### 테이블 생성 실패 시:

```bash
# .env 파일에 POSTGRES_URL 확인
# 다시 실행
node create_tables.js
```

### 배포 로그 확인:

Render 대시보드 → **"Logs"** 탭

**정상 로그:**

```
✅ PostgreSQL 연결 준비 완료
Server running on port 10000
```

---

**Happy Deploying! 🚀**
