# 🚀 완벽한 배포 가이드 (로컬 MySQL + Render PostgreSQL)

## 📌 현재 상황

✅ **로컬 개발 환경**

- MySQL 사용 중 (localhost:3306)
- 기존 데이터베이스 그대로 유지
- 코드 수정 없음

✅ **Render 배포 환경**

- PostgreSQL 사용 (완전 무료!)
- DBeaver로 관리
- 자동으로 PostgreSQL 문법 변환

---

## 🎯 작동 원리

### 자동 데이터베이스 전환

**db.js 코드:**

```javascript
// .env에 DATABASE_URL이 있으면 PostgreSQL
// 없으면 MySQL 사용
const usePostgres = !!process.env.DATABASE_URL;
```

**로컬 (.env):**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1111
DB_NAME=gallery_movie
# DATABASE_URL 없음 → MySQL 사용 ✅
```

**Render (환경 변수):**

```env
DATABASE_URL=postgresql://user:pass@host/db
# DATABASE_URL 있음 → PostgreSQL 사용 ✅
```

---

## 📋 Render 배포 체크리스트

### ✅ 준비물

- [x] GitHub 계정
- [x] 프로젝트가 GitHub에 푸시되어 있음
- [x] 로컬에 Node.js 설치되어 있음 (테이블 생성용)

**필요 없는 것:**

- ❌ PostgreSQL 로컬 설치 (불필요!)
- ❌ DBeaver 설치 (불필요!)
- ❌ psql 클라이언트 (불필요!)

### ✅ 1단계: Render PostgreSQL 생성

1. https://dashboard.render.com 접속
2. GitHub으로 로그인
3. **"New +"** → **"PostgreSQL"**
4. 설정:
   ```
   Name: moviereview-db
   Database: gallery_movie
   Region: Singapore
   Plan: Free
   ```
5. **"Create Database"** 클릭

**중요!** "Info" 탭에서 다음 정보 복사:

```
Internal Database URL: postgresql://gallery_movie_user:password@dpg-xxxxx/gallery_movie
```

### ✅ 2단계: PostgreSQL 테이블 생성

**Node.js 스크립트로 간편하게 생성! (PostgreSQL 설치 불필요)**

#### 테이블 생성

1. **.env 파일에 PostgreSQL URL 추가:**

   ```env
   # 기존 MySQL 설정
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=1111
   DB_NAME=gallery_movie

   # Render PostgreSQL URL 추가 (Step 1에서 복사한 Internal Database URL)
   POSTGRES_URL=postgresql://gallery_movie_user:password@dpg-xxxxx.singapore-postgres.render.com/gallery_movie

   # API 키
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. **테이블 생성 스크립트 실행:**

   ```bash
   node create_tables.js
   ```

3. **성공 메시지 확인:**

   ```
   ✨ PostgreSQL 테이블 생성 완료!

   🎉 성공! 생성된 테이블:
      1. comments
      2. post_likes
      3. posts
      4. review_likes
      5. reviews
      6. users
   ```

**확인:**

테이블 6개가 성공적으로 생성되었습니다! ✅

### ✅ 3단계: Render Web Service 생성

1. Render 대시보드 → **"New +"** → **"Web Service"**
2. **"Connect a repository"**
3. GitHub 저장소 선택: `happymachine55/AI-MovieReview`
4. 설정:

```
Name: ai-moviereview
Region: Singapore
Branch: main
Runtime: Node
Build Command: npm install
Start Command: node app.js
Plan: Free
```

### ✅ 4단계: 환경 변수 설정

**"Environment Variables"** 섹션에서 추가:

```env
DATABASE_URL
<Step 1에서 복사한 Internal Database URL>

GEMINI_API_KEY
//키 가져와야 함

NODE_ENV
production
```

5. **"Create Web Service"** 클릭

### ✅ 5단계: 배포 확인

**Logs 탭에서 확인:**

```
✅ PostgreSQL 연결 준비 완료
Server running on port 10000
```

**URL 접속:**

```
https://ai-moviereview.onrender.com
```

⏰ 첫 로딩: 30초~1분 (슬립 모드에서 깨어남)

---

## 🖥️ 로컬 개발 환경

### 현재 설정 (변경 없음!)

```bash
# .env 파일 (DATABASE_URL 없음)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1111
DB_NAME=gallery_movie
GEMINI_API_KEY=your_gemini_api_key_here
```

### 서버 실행

```bash
node app.js
```

**출력:**

```
✅ MySQL 연결 준비 완료
Server running on port 3000
```

**접속:**

```
http://localhost:3000
```

---

## 🔄 MySQL ↔ PostgreSQL 자동 변환

### 지원되는 기능

✅ **자동 변환:**

- `?` placeholder → `$1, $2, $3`
- `AUTO_INCREMENT` → `SERIAL`
- `ENUM('like', 'dislike')` → `TYPE like_type`
- 결과 형식 자동 변환

✅ **변경 불필요:**

- app.js 코드 그대로 사용
- SQL 쿼리 그대로 사용
- 로컬/배포 자동 전환

---

## 🐛 트러블슈팅

### 문제 1: DBeaver 연결 실패

**증상:** "Connection refused"

**해결:**

1. SSL 설정 확인: "Use SSL" 체크
2. Host 주소 정확히 입력
3. Port: 5432 확인

### 문제 2: 로컬에서 PostgreSQL 사용됨

**증상:** "✅ PostgreSQL 연결 준비 완료" 출력

**원인:** .env에 DATABASE_URL이 있음

**해결:**

```bash
# .env 파일에서 DATABASE_URL 줄 삭제 또는 주석 처리
# DATABASE_URL=postgresql://...
```

### 문제 3: Render에서 MySQL 사용 시도

**증상:** "✅ MySQL 연결 준비 완료" (Render 로그에서)

**원인:** DATABASE_URL 환경 변수 미설정

**해결:**

1. Render Web Service → "Environment" 탭
2. DATABASE_URL 추가
3. Save 후 재배포 대기

### 문제 4: 테이블이 없다는 오류

**증상:** "relation does not exist"

**원인:** PostgreSQL 테이블 미생성

**해결:**

1. DBeaver로 Render PostgreSQL 연결
2. `init_postgres.sql` 다시 실행
3. 테이블 6개 생성 확인

---

## 📊 포트 사용 현황

### 로컬 환경

```
MySQL: localhost:3306 (기존 사용 중) ✅
Node.js: localhost:3000 (app.js) ✅
```

**충돌 없음!** PostgreSQL은 로컬에 설치하지 않음.

### Render 환경

```
PostgreSQL: Render 클라우드 (5432) ✅
Node.js: Render가 자동 할당 (10000 등) ✅
```

---

## 💰 비용 정리

| 항목               | 비용                    |
| ------------------ | ----------------------- |
| Render Web Service | **무료**                |
| Render PostgreSQL  | **무료** (1GB)          |
| Gemini API         | **무료** (일일 한도 내) |
| DBeaver            | **무료** (오픈소스)     |
| **총 비용**        | **완전 무료!** 🎉       |

---

## 🎓 핵심 개념 이해

### 왜 로컬에 PostgreSQL 설치 안 해도 되나요?

**답변:**

- 로컬 개발: 기존 MySQL 계속 사용 ✅
- Render 배포: Render PostgreSQL 사용 ✅
- db.js가 자동으로 전환해줌! 🎯

### DBeaver는 언제 사용하나요?

**답변:**

- Render PostgreSQL 테이블 생성할 때
- 배포된 데이터베이스 관리할 때
- 데이터 조회/수정할 때

### 로컬 MySQL 데이터는 어떻게 되나요?

**답변:**

- 그대로 유지됩니다! ✅
- 로컬 개발 계속 가능
- Render는 별도 데이터베이스 사용

---

## ✅ 최종 체크리스트

### Render 배포 전

- [ ] Render PostgreSQL 생성
- [ ] Internal Database URL 복사
- [ ] DBeaver 연결 설정 (SSL 포함)
- [ ] `init_postgres.sql` 실행
- [ ] 테이블 6개 생성 확인

### Render 배포

- [ ] Web Service 생성
- [ ] 환경 변수 3개 설정 (DATABASE_URL, GEMINI_API_KEY, NODE_ENV)
- [ ] 빌드 성공 확인
- [ ] URL 접속 테스트

### 로컬 개발

- [ ] .env에 DATABASE_URL 없음 확인
- [ ] `node app.js` 실행
- [ ] "MySQL 연결 준비 완료" 출력 확인
- [ ] localhost:3000 접속 가능

---

## 🚀 다음 단계

1. ✅ **Render PostgreSQL 생성** (지금 바로!)
2. ✅ **DBeaver로 테이블 생성** (5분)
3. ✅ **Render Web Service 배포** (10분)
4. 🎉 **완료!** 무료로 배포 성공!

---

## 📞 참고 문서

- **DBeaver 설정**: `DBEAVER_SETUP.md`
- **Render 배포**: `RENDER_DEPLOY.md`
- **PostgreSQL SQL**: `init_postgres.sql`

궁금한 점 있으면 언제든 물어보세요! 🙋‍♂️
