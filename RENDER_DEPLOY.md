# 🎨 Render + PostgreSQL 완전 무료 배포 가이드

## 🌟 완전 무료로 배포하기!

- ✅ **Render 웹 서비스**: 완전 무료 (750시간/월)
- ✅ **Render PostgreSQL**: 완전 무료 (1GB 스토리지)
- ✅ **크레딧 소진 걱정 없음!**
- ✅ **자동 슬립 모드**: 15분 미사용 시 자동 절전
- ✅ **자동 SSL (HTTPS)**
- ⏰ **첫 로딩**: 30초~1분 (슬립에서 깨어나는 시간)

---

## 📋 완료된 작업

### ✅ 코드 수정 완료

- [x] `pg` 패키지 설치 완료
- [x] `db.js` MySQL/PostgreSQL 자동 전환 지원
- [x] PostgreSQL 초기화 SQL 생성 (`init_postgres.sql`)
- [x] `render.yaml` 설정 파일 생성
- [x] **로컬에서는 MySQL, Render에서는 PostgreSQL 자동 사용**

---

## 🚀 Render 배포 5단계

### Step 1: Render 계정 생성

1. **Render 접속**: https://render.com
2. **"Get Started for Free"** 클릭
3. **"Sign Up with GitHub"** 선택 (가장 쉬움!)
4. GitHub 계정 연동 승인

### Step 2: PostgreSQL 데이터베이스 생성 (먼저!)

1. Render 대시보드에서 **"New +"** 클릭
2. **"PostgreSQL"** 선택
3. 설정 입력:
   ```
   Name: moviereview-db
   Database: gallery_movie
   User: (자동 생성됨)
   Region: Singapore (한국과 가장 가까움)
   PostgreSQL Version: 15 (최신)
   Datadog API Key: (비워둠)
   Plan: Free
   ```
4. **"Create Database"** 클릭
5. ⏰ 생성 완료까지 1~2분 대기

6. 생성 완료 후 **"Info"** 탭에서 다음 정보 확인:
   - ✅ **Internal Database URL** (중요! 복사해두기)
   - 예시: `postgresql://user:password@dpg-xxxxx/gallery_movie`

### Step 3: PostgreSQL 테이블 생성

데이터베이스가 생성되면 테이블을 만들어야 합니다.

#### 🚀 Node.js 스크립트 사용 (추천! PostgreSQL 설치 불필요)

**로컬 컴퓨터에서 실행:**

1. **.env 파일에 PostgreSQL URL 추가:**

   ```env
   # 기존 MySQL 설정
   DB_HOST=localhost
   DB_USER=your_put_code
   DB_PASSWORD=your_put_code
   DB_NAME=gallery_movie

   # Render PostgreSQL URL 추가 (Step 2에서 복사한 Internal Database URL)
   POSTGRES_URL=postgresql://gallery_movie_l9rv_user:password@dpg-xxxxx.singapore-postgres.render.com/gallery_movie_l9rv

   # API 키
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. **테이블 생성 스크립트 실행:**

   ```bash
   node create_tables.js
   ```

3. **결과 확인:**

   ```
   🔌 Render PostgreSQL 연결 중...
   ✅ 연결 성공!

   👥 users 테이블 생성 중...
   ✅ users 테이블 생성 완료
   ⭐ reviews 테이블 생성 중...
   ✅ reviews 테이블 생성 완료
   ... (나머지 테이블도 동일)

   🎉 성공! 생성된 테이블:
      1. comments
      2. post_likes
      3. posts
      4. review_likes
      5. reviews
      6. users

   ✨ PostgreSQL 테이블 생성 완료!
   ```

#### 대안: Render 웹 콘솔 사용 (복잡함, 비추천)

1. PostgreSQL 대시보드 → 왼쪽 메뉴 **"Shell"** 클릭
2. 자동으로 psql 콘솔이 열림
3. 프로젝트의 `init_postgres.sql` 파일 내용을 복사
4. psql 콘솔에 붙여넣기
5. Enter 키로 실행

**⚠️ 주의:** Render 웹 콘솔은 불안정할 수 있으므로 **Node.js 스크립트 사용을 강력히 추천합니다!**

### Step 4: Web Service 생성

1. Render 대시보드에서 **"New +"** → **"Web Service"** 클릭
2. **"Connect a repository"** 클릭
3. GitHub 저장소 연결 및 선택:
   - **저장소**: `happymachine55/AI-MovieReview`
   - **"Connect"** 클릭
4. 설정 입력:
   ```
   Name: ai-moviereview
   Region: Singapore
   Branch: main
   Root Directory: (비워둠)
   Runtime: Node
   Build Command: npm install
   Start Command: node app.js
   Plan: Free
   ```
5. **스크롤 다운** → 환경 변수 설정으로 이동

### Step 5: 환경 변수 설정 (중요!)

"Advanced" → "Environment Variables" 섹션에서 추가:

#### 필수 환경 변수

1. **DATABASE_URL** (PostgreSQL 연결)
   ```
   Key: DATABASE_URL
   Value: <Step 2에서 복사한 Internal Database URL>
   ```
2. **GEMINI_API_KEY** (AI 리뷰 생성)

   ```
   Key: GEMINI_API_KEY
   Value:
   ```

3. **NODE_ENV** (프로덕션 모드)
   ```
   Key: NODE_ENV
   Value: production
   ```

#### 선택 환경 변수

4. **NODE_VERSION** (Node.js 버전 고정)
   ```
   Key: NODE_VERSION
   Value: 18.17.0
   ```

모든 환경 변수 입력 후 **"Create Web Service"** 클릭!

---

## ⏳ 배포 진행

### 자동으로 진행되는 작업들:

1. ✅ **GitHub에서 코드 가져오기**
2. ✅ **npm install 실행** (패키지 설치)
3. ✅ **node app.js 실행** (서버 시작)
4. ✅ **"Server running on port XXXX"** 로그 확인

배포 완료까지 **3~5분** 소요됩니다.

---

## 🔍 배포 확인

### 1. 로그 확인

Render 대시보드 → **"Logs"** 탭에서 확인:

```
✅ PostgreSQL 연결 준비 완료
Server running on port 10000
```

### 2. URL 접속

- Render에서 자동으로 생성된 URL: `https://ai-moviereview.onrender.com`
- **첫 접속은 30초~1분 소요** (슬립 모드에서 깨어남)

### 3. 기능 테스트

- [ ] 메인 페이지 로딩
- [ ] 회원가입 작동
- [ ] 로그인 작동
- [ ] 영화 목록 표시
- [ ] 리뷰 작성 (좋아요/싫어요 포함)
- [ ] 게시글 작성
- [ ] AI 리뷰 생성 (Gemini API)

---

## 💡 로컬에서 테스트 (선택)

로컬에서는 MySQL을 계속 사용할 수 있습니다!

```bash
# .env 파일에 DATABASE_URL이 없으면 자동으로 MySQL 사용
npm start
```

PostgreSQL로 로컬 테스트하려면:

```bash
# .env 파일에 추가
DATABASE_URL=postgresql://user:password@localhost:5432/gallery_movie
```

---

## 🐛 트러블슈팅

### 문제 1: "Cannot find module 'pg'"

**해결:**

```bash
npm install pg
git add .
git commit -m "Add pg dependency"
git push origin main
```

Render에서 자동으로 재배포됩니다.

### 문제 2: 데이터베이스 연결 실패

**확인 사항:**

- [ ] `DATABASE_URL` 환경 변수가 정확한지 확인
- [ ] Internal Database URL 사용했는지 (External URL 아님!)
- [ ] PostgreSQL 데이터베이스가 "Available" 상태인지 확인

**해결:**

1. PostgreSQL 대시보드 → "Info" 탭
2. **Internal Database URL** 다시 복사
3. Web Service → "Environment" 탭
4. `DATABASE_URL` 값 업데이트
5. 자동 재배포 대기

### 문제 3: 테이블이 없다는 오류

**해결:**

1. PostgreSQL 대시보드 → "Shell" 탭
2. 테이블 확인:
   ```sql
   \dt
   ```
3. 테이블이 없으면 `init_postgres.sql` 다시 실행

### 문제 4: 서버가 시작되지 않음

**로그 확인:**

1. Web Service → "Logs" 탭
2. 오류 메시지 확인

**일반적인 원인:**

- 환경 변수 누락
- PostgreSQL 연결 실패
- 포트 충돌 (Render는 자동으로 PORT 설정함)

---

## ⚠️ Render 무료 플랜 제한사항

### 웹 서비스

- ✅ **750시간/월 무료** (한 달 내내 가능!)
- ⏰ **15분 비활성 시 자동 슬립**
- 🐌 **첫 접속 시 30초~1분 로딩**
- 🔄 **매월 자동 갱신**

### PostgreSQL

- ✅ **1GB 스토리지**
- ✅ **무제한 쿼리**
- ⏰ **90일 후 자동 삭제** (무료 플랜)
- 📦 **백업 필수!**

### 해결책: 슬립 방지

**UptimeRobot 사용** (무료):

1. https://uptimerobot.com 가입
2. **"Add New Monitor"** 클릭
3. 설정:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: AI MovieReview
   URL: https://ai-moviereview.onrender.com
   Monitoring Interval: 5 minutes
   ```
4. **"Create Monitor"** 클릭

→ 5분마다 자동으로 사이트 접속해서 슬립 방지!

---

## 🔄 업데이트 배포

코드를 수정한 후:

```bash
git add .
git commit -m "업데이트 내용"
git push origin main
```

Render에서 자동으로 재배포됩니다! (3~5분 소요)

---

## 📊 데이터베이스 백업 (중요!)

Render 무료 PostgreSQL은 90일 후 삭제됩니다.

### 백업 방법

#### 1. pgAdmin 사용

1. pgAdmin 설치: https://www.pgadmin.org
2. Render의 External Database URL로 연결
3. 데이터베이스 우클릭 → "Backup"

#### 2. pg_dump 사용

```bash
pg_dump <External Database URL> > backup.sql
```

#### 3. Render 대시보드

PostgreSQL → "Backups" 탭에서 다운로드

---

## 🆚 MySQL vs PostgreSQL 차이점

### 자동으로 처리되는 부분 (신경 쓸 필요 없음!)

- ✅ `?` placeholder → `$1, $2, $3` 변환
- ✅ `AUTO_INCREMENT` → `SERIAL` 변환
- ✅ `ENUM` 타입 자동 생성
- ✅ MySQL 결과 형식으로 자동 변환

### 개발자가 알아야 할 차이점

| 항목        | MySQL              | PostgreSQL     |
| ----------- | ------------------ | -------------- |
| 자동 증가   | AUTO_INCREMENT     | SERIAL         |
| 문자열 비교 | 대소문자 구분 안함 | 대소문자 구분  |
| ENUM        | 직접 사용          | TYPE 먼저 생성 |
| 날짜 함수   | NOW()              | NOW() (동일)   |

**걱정 마세요!** `db.js`에서 대부분 자동 처리됩니다.

---

## 🎉 배포 완료!

### GitHub README 업데이트

```markdown
## 🌐 Live Demo

https://ai-moviereview.onrender.com

⚠️ 첫 로딩은 30초~1분 소요됩니다 (무료 플랜의 슬립 모드)
```

### 공유하기

친구들에게 URL 공유:

```
https://ai-moviereview.onrender.com
```

---

## 📞 도움말

- **Render 문서**: https://render.com/docs
- **PostgreSQL 문서**: https://www.postgresql.org/docs/
- **GitHub Issues**: https://github.com/happymachine55/AI-MovieReview/issues

---

## 💰 비용 정리

| 항목               | 비용                    |
| ------------------ | ----------------------- |
| Render Web Service | **무료**                |
| Render PostgreSQL  | **무료**                |
| Gemini API         | **무료 (일일 한도 내)** |
| 도메인 (선택)      | 연 $10~15               |

**총 비용**: **완전 무료!** 🎉

---

## 🚀 다음 단계

1. ✅ Render 배포 완료
2. 🔄 UptimeRobot으로 슬립 방지 설정
3. 📱 모바일에서 테스트
4. 🎨 커스텀 도메인 연결 (선택)
5. 📊 구글 애널리틱스 추가 (선택)

축하합니다! 완전 무료로 배포 완료! 🎊
