# 🎬 AI-MovieReview

영화 리뷰를 AI가 자동 생성해주는 커뮤니티 웹사이트

---

## 👨‍🏫 프로젝트 소개

사용자가 선택한 감정 키워드와 평점을 기반으로 **AI(Gemini API)**가 자동으로 영화 리뷰를 생성해주는 서비스입니다.  
생성된 3가지 리뷰 중 마음에 드는 것을 선택하여 바로 게시할 수 있으며, 커뮤니티 기능을 통해 다른 사용자들과 소통할 수 있습니다.

---

## ⏲️ 개발 기간

- **2025.03.20(목) ~ 2025.12.06(토)**
- ✅ AI 리뷰 자동 생성 기능 구현
- ✅ 회원 인증 시스템 (로그인/로그아웃)
- ✅ 커뮤니티 기능 (게시글 작성, 댓글, 삭제)
- ✅ 본인 게시글/댓글만 삭제 가능 (권한 관리)
- ✅ 페이지네이션 (10개씩 게시글 표시)
- ✅ 영화 검색 기능
- ✅ 반응형 UI/UX 디자인

---

## 🧑‍🤝‍🧑 개발자 소개

- **김원묵** : 팀장, 편집
- **서한별** : 기획자, 백엔드/프론트엔집 개발

---

## 💻 개발환경

- **Version** : Node.js v22.14.0
- **IDE** : VS Code
- **Framework** : Express.js (Node.js)
- **Database** : MySQL 8.0.41
- **AI API** : Google Gemini 2.0-flash

---

## ⚙️ 기술 스택

### Backend

- **Node.js** : 서버 런타임 환경
- **Express.js** : 웹 서버 프레임워크
- **MySQL2** : 데이터베이스 연결
- **express-session** : 세션 기반 인증
- **dotenv** : 환경 변수 관리
- **node-fetch** : Gemini API 호출

### Frontend

- **Vanilla JavaScript** : 클라이언트 로직
- **HTML5 / CSS3** : 마크업 및 스타일링
- **Font Awesome** : 아이콘

### Database

- **MySQL** : 관계형 데이터베이스
- **테이블 구조**:
  - `users` : 사용자 정보
  - `posts` : 게시글
  - `comments` : 댓글
  - `reviews` : 영화 리뷰
  - `movies` : 영화 정보

---

## 📌 주요 기능

### 1. 🤖 AI 자동 리뷰 생성

- 사용자가 **감정 키워드**(최대 10개), **평점**(1~10점), **추천 여부**를 선택
- Gemini API가 3가지 다른 스타일의 리뷰 자동 생성
- 생성된 리뷰 중 하나를 선택하여 바로 게시 가능

### 2. 🔐 회원 인증 시스템

- 세션 기반 로그인/로그아웃
- 로그인 후에만 게시글/리뷰 작성 가능
- 본인이 작성한 글만 삭제 가능 (권한 관리)

### 3. 📝 커뮤니티 기능

- **게시글 작성/조회/삭제**
- **댓글 작성/삭제**
- **페이지네이션** : 게시글 10개씩 표시
- **검색 기능** : 영화 제목, 배우, 감독으로 검색

### 4. 🎬 영화 리뷰 시스템

- 별점 및 추천 여부 표시
- 리뷰 작성 시간 표시
- 본인 리뷰만 삭제 가능

### 5. 🎨 사용자 경험

- **DCInside 스타일** 디자인
- **고정 크기** 입력창 (크기 조절 불가)
- **반응형 디자인**
- **부드러운 애니메이션**

---

## 📁 프로젝트 구조

```
movie_exercise2.12/
├── frontend/               # 프론트엔드 파일
│   ├── index.html         # 메인 HTML
│   ├── style.css          # 스타일시트
│   ├── script.js          # 클라이언트 로직
│   └── movies.js          # 영화 데이터
├── app.js                 # Express 서버 (백엔드 API)
├── db.js                  # MySQL 연결 설정
├── .env                   # 환경 변수 (DB 정보, API 키)
├── package.json           # 프로젝트 의존성
└── README.md              # 프로젝트 문서
```

---

## 🚀 설치 및 실행 방법

### 1. 프로젝트 클론

```bash
git clone https://github.com/happymachine55/AI-MovieReview.git
cd AI-MovieReview
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일 생성:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gallery_movie
GEMINI_API_KEY=your_gemini_api_key
```

### 4. MySQL 데이터베이스 설정

```sql
CREATE DATABASE gallery_movie;

USE gallery_movie;

-- 사용자 테이블
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 게시글 테이블
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    recommend INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 댓글 테이블
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 리뷰 테이블
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_title VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    rating DECIMAL(3,1) NOT NULL,
    content TEXT NOT NULL,
    recommend VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 5. 서버 실행

```bash
node app.js
```

### 6. 브라우저에서 접속

```
http://localhost:3000
```

---

## 📖 API 명세

### 인증 API

| Method | Endpoint    | 설명             |
| ------ | ----------- | ---------------- |
| POST   | /api/login  | 로그인           |
| POST   | /api/logout | 로그아웃         |
| GET    | /api/me     | 로그인 상태 확인 |

### 게시글 API

| Method | Endpoint       | 설명                 |
| ------ | -------------- | -------------------- |
| GET    | /api/posts     | 전체 게시글 조회     |
| GET    | /api/posts/:id | 특정 게시글 조회     |
| POST   | /api/posts     | 게시글 작성          |
| DELETE | /api/posts/:id | 게시글 삭제 (본인만) |

### 댓글 API

| Method | Endpoint          | 설명               |
| ------ | ----------------- | ------------------ |
| GET    | /api/comments     | 댓글 조회          |
| POST   | /api/comments     | 댓글 작성          |
| DELETE | /api/comments/:id | 댓글 삭제 (본인만) |

### 리뷰 API

| Method | Endpoint         | 설명               |
| ------ | ---------------- | ------------------ |
| GET    | /api/reviews     | 리뷰 조회          |
| POST   | /api/reviews     | 리뷰 작성          |
| DELETE | /api/reviews/:id | 리뷰 삭제 (본인만) |

### AI API

| Method | Endpoint       | 설명             |
| ------ | -------------- | ---------------- |
| POST   | /api/ai-review | AI 리뷰 3개 생성 |

---

## 🔒 보안 기능

- ✅ 세션 기반 인증 (express-session)
- ✅ SQL Injection 방지 (Prepared Statements)
- ✅ 권한 검증 (본인만 삭제 가능)
- ✅ 환경 변수로 민감 정보 관리 (.env)

---

## 📝 향후 개선 사항

- [ ] 비밀번호 암호화 (bcrypt)
- [ ] 프로필 이미지 업로드
- [ ] 좋아요/싫어요 기능
- [ ] 실시간 알림 (Socket.io)
- [ ] 관리자 페이지
- [ ] OAuth 로그인 (Google, Kakao)

---

## 📄 라이선스

This project is licensed under the MIT License.

---

## 📧 문의

프로젝트 관련 문의사항은 [GitHub Issues](https://github.com/happymachine55/AI-MovieReview/issues)에 남겨주세요.

---

## 🚀 배포하기 (Render)

### 🎯 완료된 배포 현황

✅ **프로덕션 URL**: [https://ai-moviereview.onrender.com](https://ai-moviereview.onrender.com)  
✅ **배포 플랫폼**: Render (Free Plan)  
✅ **데이터베이스**: PostgreSQL 15 (1GB)  
✅ **자동 배포**: GitHub main 브랜치 푸시 시 자동 재배포

---

### 📚 배포 전체 프로세스

우리가 진행한 배포 과정을 단계별로 정리했습니다.

#### 1️⃣ Render PostgreSQL 생성

**목적**: 무료 클라우드 데이터베이스 생성

```bash
# Render 대시보드에서 진행
1. https://dashboard.render.com 접속
2. New + → PostgreSQL
3. Name: moviereview-db
   Database: gallery_movie
   Region: Singapore
   Version: 15
   Plan: Free
4. Create Database 클릭
5. Internal Database URL 복사
```

**결과**: `postgresql://user:password@dpg-xxxxx.singapore-postgres.render.com/gallery_movie`

---

#### 2️⃣ PostgreSQL 테이블 생성

**목적**: 로컬 MySQL 테이블 구조를 PostgreSQL에 복제

**방법**: Node.js 스크립트 사용 (PostgreSQL 설치 불필요!)

```bash
# 1. .env 파일에 PostgreSQL URL 추가
POSTGRES_URL=postgresql://user:password@dpg-xxxxx.singapore-postgres.render.com/gallery_movie

# 2. 테이블 생성 스크립트 실행
node create_tables.js
```

**생성되는 테이블 (6개)**:

- `users` - 사용자 정보
- `reviews` - 영화 리뷰
- `posts` - 게시글
- `comments` - 댓글
- `review_likes` - 리뷰 좋아요/싫어요
- `post_likes` - 게시글 좋아요/싫어요

**특징**:

- ✅ MySQL의 AUTO_INCREMENT → PostgreSQL의 SERIAL 자동 변환
- ✅ 외래 키(Foreign Key) 관계 유지
- ✅ 인덱스 자동 생성으로 성능 최적화

---

#### 3️⃣ MySQL → PostgreSQL 데이터 마이그레이션

**목적**: 로컬 개발 데이터를 프로덕션 DB로 이전

**방법 A: 완전 동기화 (테이블 구조 + 데이터)**

```bash
node sync_mysql_to_postgres.js
```

**특징**:

- ✅ MySQL 테이블 구조 자동 분석
- ✅ PostgreSQL에 테이블 재생성
- ✅ 데이터 타입 자동 변환 (INT→INTEGER, DATETIME→TIMESTAMP)
- ✅ 외래 키, 인덱스, 시퀀스 모두 동기화

**방법 B: 데이터만 마이그레이션 (테이블 구조 유지)**

```bash
node migrate_to_postgres.js
```

**특징**:

- ✅ 기존 테이블 구조 그대로 유지
- ✅ 데이터만 복사 (TRUNCATE → INSERT)
- ✅ 빠른 실행 속도

**언제 사용?**

- 로컬에서 테스트 데이터 추가 후 → 프로덕션에 반영
- 개발 중 새로운 사용자/리뷰/게시글 추가 후 → 배포 서버에 동기화

---

#### 4️⃣ Render Web Service 배포

**목적**: Node.js 애플리케이션 배포

```bash
# Render 대시보드에서 진행
1. New + → Web Service
2. Connect GitHub repository: happymachine55/AI-MovieReview
3. 설정:
   - Name: ai-moviereview
   - Region: Singapore
   - Branch: main
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node app.js
   - Plan: Free

4. 환경 변수 설정:
   DATABASE_URL=<PostgreSQL Internal URL>
   GEMINI_API_KEY=<your_api_key>
   NODE_ENV=production

5. Create Web Service 클릭
```

**배포 로그 확인**:

```
✅ PostgreSQL 연결 준비 완료
Server running on port 10000
```

---

#### 5️⃣ 자동 배포 설정 (CI/CD)

**목적**: 코드 수정 시 자동으로 Render에 재배포

**현재 설정**:

```bash
# GitHub main 브랜치에 푸시하면 자동 재배포
git add .
git commit -m "feat: Add new feature"
git push origin main
```

**Render에서 자동으로**:

1. GitHub 변경 감지
2. `npm install` 실행
3. `node app.js`로 서버 재시작
4. 새 버전 배포 완료 (3~5분 소요)

**주의사항**:

- ⚠️ 코드만 자동 배포됨 (데이터베이스 변경 사항 아님)
- ⚠️ 테이블 구조 변경 시 → `node create_tables.js` 수동 실행 필요
- ⚠️ 로컬 데이터 추가 시 → `node sync_mysql_to_postgres.js` 수동 실행 필요

---

### 🔄 개발 워크플로우

#### 로컬 개발 → 프로덕션 배포 과정

```mermaid
graph LR
    A[로컬 MySQL] --> B[코드 수정]
    B --> C[Git Push]
    C --> D[Render 자동 재배포]

    A --> E[데이터 추가]
    E --> F[sync_mysql_to_postgres.js]
    F --> G[Render PostgreSQL]
```

**단계별 설명**:

**1. 코드만 수정한 경우** (파일 변경, 버그 수정 등)

```bash
# 로컬에서 테스트
node app.js

# GitHub에 푸시
git add .
git commit -m "fix: Bug fix"
git push origin main

# Render가 자동으로 재배포 (끝!)
```

**2. 테이블 구조를 변경한 경우** (새 컬럼 추가, 테이블 추가 등)

```bash
# 로컬 MySQL에서 테이블 수정

# Render PostgreSQL에 반영
node create_tables.js

# 코드 푸시
git add .
git commit -m "feat: Add new table"
git push origin main
```

**3. 데이터를 추가한 경우** (새 사용자, 리뷰, 게시글 등)

```bash
# 로컬 MySQL에 데이터 추가

# Render PostgreSQL에 동기화
node sync_mysql_to_postgres.js
# 또는
node migrate_to_postgres.js

# 필요시 코드도 푸시
git push origin main
```

---

### 🛠️ 유용한 스크립트

우리가 만든 배포 자동화 스크립트들:

| 스크립트                    | 기능                             | 사용 시기                        |
| --------------------------- | -------------------------------- | -------------------------------- |
| `create_tables.js`          | PostgreSQL 테이블 생성           | 최초 배포, 테이블 구조 변경 시   |
| `sync_mysql_to_postgres.js` | 테이블 구조 + 데이터 완전 동기화 | 테이블 스키마 변경 + 데이터 이전 |
| `migrate_to_postgres.js`    | 데이터만 마이그레이션            | 데이터만 추가/수정된 경우        |

**실행 방법**:

```bash
# .env 파일에 POSTGRES_URL 설정 후
node <스크립트명>
```

---

### 📖 상세 가이드 문서

- 📘 [빠른 배포 가이드](QUICK_DEPLOY.md) - 3단계로 끝내기 (5분)
- 📗 [전체 배포 가이드](DEPLOYMENT_GUIDE.md) - 상세 설명 (15-20분)
- 📙 [Render 플랫폼 가이드](RENDER_DEPLOY.md) - Render 사용법 (20-30분)
- 📕 [데이터 동기화 가이드](DATA_SYNC_GUIDE.md) - MySQL ↔ PostgreSQL (10-15분)

---

### ⚙️ 환경 비교

| 항목             | 로컬 개발 환경  | Render 프로덕션 환경        |
| ---------------- | --------------- | --------------------------- |
| **데이터베이스** | MySQL 8.0.41    | PostgreSQL 15               |
| **포트**         | 3000            | 10000 (자동 할당)           |
| **환경 변수**    | `.env` 파일     | Render 대시보드 설정        |
| **데이터 관리**  | MySQL Workbench | Node.js 스크립트            |
| **배포 방법**    | `node app.js`   | Git push → 자동 배포        |
| **URL**          | localhost:3000  | ai-moviereview.onrender.com |
| **SSL/HTTPS**    | ❌              | ✅ 자동 적용                |
| **슬립 모드**    | ❌              | ✅ 15분 미사용 시           |

**자동 DB 전환 로직** (`db.js`):

```javascript
// DATABASE_URL 환경 변수 존재 여부로 자동 판단
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  // Render 배포 환경 → PostgreSQL 사용
} else {
  // 로컬 개발 환경 → MySQL 사용
}
```

---

### 💰 배포 비용

| 항목               | 비용                              |
| ------------------ | --------------------------------- |
| Render Web Service | **무료** (750시간/월)             |
| Render PostgreSQL  | **무료** (1GB, 90일 후 갱신 필요) |
| Gemini API         | **무료** (일일 한도 내)           |
| 도메인             | **무료** (.onrender.com)          |
| SSL 인증서         | **무료** (자동 적용)              |
| **총 비용**        | **완전 무료!** 🎉                 |

**주의**: Render 무료 플랜은 15분 미사용 시 슬립 모드 진입 (첫 접속 시 30초~1분 소요)

---

### 🎯 배포 성공 체크리스트

#### ✅ 배포 전

- [x] GitHub 저장소 생성 및 코드 푸시
- [x] Render PostgreSQL 생성
- [x] `create_tables.js`로 테이블 생성
- [x] 환경 변수 설정 (DATABASE_URL, GEMINI_API_KEY)

#### ✅ 배포 완료

- [x] Render Web Service 생성
- [x] 빌드 성공 확인
- [x] "PostgreSQL 연결 준비 완료" 로그 확인
- [x] 프로덕션 URL 접속 가능

#### ✅ 운영 중

- [x] Git push 시 자동 재배포 작동
- [x] 데이터 동기화 스크립트 사용 가능
- [x] 로컬 개발 환경 정상 작동

---

### 🔧 트러블슈팅

**문제: 배포 후 "Database connection failed"**

```bash
# 해결: DATABASE_URL 환경 변수 확인
Render 대시보드 → Web Service → Environment → DATABASE_URL 재설정
```

**문제: 테이블이 없다는 오류**

```bash
# 해결: 테이블 재생성
node create_tables.js
```

**문제: 로컬 데이터가 Render에 없음**

```bash
# 해결: 데이터 동기화
node sync_mysql_to_postgres.js
```

**문제: 코드 수정 후 배포되지 않음**

```bash
# 해결: Render에서 수동 재배포
Render 대시보드 → Web Service → Manual Deploy → Deploy latest commit
```

---

### 🌐 로컬 vs 배포 환경

**로컬 개발** (`npm start` 또는 `node app.js`):

```
✅ MySQL 연결 준비 완료
Server running on port 3000
→ http://localhost:3000
```

**Render 배포** (자동):

```
✅ PostgreSQL 연결 준비 완료
Server running on port 10000
→ https://ai-moviereview.onrender.com
```

---

- 배포: Render 환경 변수 `DATABASE_URL` 있음 → PostgreSQL 사용

---

## 📚 배포 문서 읽는 순서

배포가 처음이라면 이 순서대로 문서를 읽으세요!

### 1️⃣ 빠른 시작 (초보자용)

**파일:** `QUICK_DEPLOY.md`  
**소요 시간:** 5분  
**내용:** 3단계로 끝나는 빠른 배포 가이드

```bash
1. Render PostgreSQL 생성
2. node create_tables.js 실행
3. Render Web Service 배포
```

### 2️⃣ 상세 배포 가이드 (추천!)

**파일:** `DEPLOYMENT_GUIDE.md`  
**소요 시간:** 15-20분  
**내용:**

- 전체 배포 프로세스 상세 설명
- 로컬 MySQL vs Render PostgreSQL 차이
- 자동 데이터베이스 전환 원리
- 트러블슈팅 가이드

**읽는 순서:**

1. 현재 상황 파악
2. 작동 원리 이해
3. Render 배포 체크리스트 따라하기
4. 로컬 개발 환경 설정

### 3️⃣ Render 플랫폼 가이드

**파일:** `RENDER_DEPLOY.md`  
**소요 시간:** 20-30분  
**내용:**

- Render 플랫폼 상세 사용법
- PostgreSQL 테이블 생성 방법
- 환경 변수 설정
- 무료 플랜 제한사항
- 슬립 모드 해결책

**언제 읽을까?**

- Render 플랫폼이 처음인 경우
- 환경 변수 설정이 헷갈릴 때
- 배포 후 문제 해결이 필요할 때

### 4️⃣ 데이터 동기화

**파일:** `DATA_SYNC_GUIDE.md`  
**소요 시간:** 10-15분  
**내용:**

- 로컬 MySQL → Render PostgreSQL 데이터 복사
- 3가지 동기화 방법
- 자주 묻는 질문

**언제 읽을까?**

- 로컬 테스트 데이터를 배포 서버에 올리고 싶을 때
- 개발 중 추가한 데이터를 프로덕션에 반영할 때

### 5️⃣ DBeaver 가이드 (참고용)

**파일:** `DBEAVER_SETUP.md`  
**상태:** ⚠️ 더 이상 사용 안 함 (아카이브)  
**내용:**

- Node.js 스크립트 사용을 권장
- DBeaver는 복잡하고 불안정함

---

## 🎯 상황별 추천 문서

### 처음 배포하는 경우

```
QUICK_DEPLOY.md → DEPLOYMENT_GUIDE.md
```

### 배포 중 문제 발생

```
RENDER_DEPLOY.md (트러블슈팅 섹션)
```

### 데이터 이전 필요

```
DATA_SYNC_GUIDE.md
```

### 전체 이해하고 싶은 경우

```
DEPLOYMENT_GUIDE.md → RENDER_DEPLOY.md → DATA_SYNC_GUIDE.md
```

---
