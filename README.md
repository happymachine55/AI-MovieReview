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
- **Database** : 
  - 로컬 개발: MySQL 8.0.41
  - 프로덕션: PostgreSQL 15 (Render)
- **AI API** : Google Gemini 2.0-flash
- **배포** : Render (Free Plan)

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

- **MySQL / PostgreSQL** : 관계형 데이터베이스 (자동 전환)
  - 로컬 개발: MySQL 8.0.41
  - Render 배포: PostgreSQL 15
- **테이블 구조** (6개):
  - `users` : 사용자 정보
  - `reviews` : 영화 리뷰
  - `posts` : 게시글
  - `comments` : 댓글
  - `review_likes` : 리뷰 좋아요/싫어요
  - `post_likes` : 게시글 좋아요/싫어요

### Deployment

- **Render** : 무료 클라우드 호스팅
- **CI/CD** : GitHub 푸시 시 자동 배포
- **SSL** : 자동 HTTPS 적용

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
├── frontend/                      # 프론트엔드 파일
│   ├── index.html                # 메인 HTML
│   ├── style.css                 # 스타일시트
│   ├── script.js                 # 클라이언트 로직
│   └── movies.js                 # 영화 데이터
├── app.js                        # Express 서버 (백엔드 API)
├── db.js                         # 데이터베이스 연결 (MySQL/PostgreSQL 자동 전환)
├── create_tables.js              # PostgreSQL 테이블 생성 스크립트
├── migrate_to_postgres.js        # MySQL → PostgreSQL 데이터 마이그레이션
├── sync_mysql_to_postgres.js     # MySQL → PostgreSQL 완전 동기화
├── sync_postgres_to_mysql.js     # PostgreSQL → MySQL 역방향 동기화
├── realtime_sync.js              # MySQL → PostgreSQL 실시간 동기화 (5초)
├── .env                          # 환경 변수 (DB 정보, API 키)
├── .env.example                  # 환경 변수 예시
├── package.json                  # 프로젝트 의존성
├── README.md                     # 프로젝트 문서
├── DEPLOYMENT_GUIDE.md           # 전체 배포 가이드
├── RENDER_DEPLOY.md              # Render 플랫폼 가이드
├── DATA_SYNC_GUIDE.md            # 데이터 동기화 가이드
├── BIDIRECTIONAL_SYNC_GUIDE.md   # 양방향 동기화 가이드
└── REALTIME_SYNC_GUIDE.md        # 실시간 동기화 가이드
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
# MySQL (로컬 개발)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gallery_movie

# Google Gemini API 키
GEMINI_API_KEY=your_gemini_api_key

# PostgreSQL (Render 배포 - 선택사항)
POSTGRES_URL=postgresql://user:password@host.render.com/database
```

**참고**: `DATABASE_URL` 환경 변수가 있으면 PostgreSQL 사용, 없으면 MySQL 사용 (자동 전환)

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

## 🚀 배포 및 동기화

### 🎯 배포 현황

✅ **프로덕션 URL**: [https://ai-moviereview.onrender.com](https://ai-moviereview.onrender.com)  
✅ **배포 플랫폼**: Render (Free Plan)  
✅ **데이터베이스**: PostgreSQL 15 (1GB) - Singapore Region  
✅ **자동 배포**: GitHub main 브랜치 푸시 시 자동 재배포  
✅ **양방향 동기화**: MySQL ⇄ PostgreSQL 실시간 동기화 지원

---

### 📚 Render 배포 프로세스

#### 1️⃣ Render PostgreSQL 생성

**Render 대시보드 설정:**

```bash
1. https://dashboard.render.com 접속 및 로그인
2. New + → PostgreSQL 선택
3. 설정:
   - Name: gallery_movie_l9rv
   - Database: gallery_movie_l9rv
   - Region: Singapore (낮은 지연시간)
   - Version: 15
   - Plan: Free
4. Create Database 클릭
5. Info 탭에서 Internal Database URL 복사
```

**결과**: `postgresql://gallery_movie_l9rv_user:비밀번호@dpg-xxxxx.singapore-postgres.render.com/gallery_movie_l9rv`

---

#### 2️⃣ PostgreSQL 테이블 생성

**로컬에서 Node.js 스크립트로 실행** (PostgreSQL 설치 불필요!)

```bash
# 1. .env 파일에 POSTGRES_URL 추가
POSTGRES_URL=postgresql://gallery_movie_l9rv_user:비밀번호@호스트/gallery_movie_l9rv

# 2. 테이블 생성 스크립트 실행
node create_tables.js
```

**생성되는 테이블 (6개)**:
- `users` - 사용자 정보 (id, username, password, created_at)
- `reviews` - 영화 리뷰 (id, user_id, movie_title, rating, content, recommend, likes/dislikes)
- `posts` - 게시글 (id, user_id, title, content, views, recommend, likes/dislikes)
- `comments` - 댓글 (id, post_id, user_id, content, created_at)
- `review_likes` - 리뷰 좋아요/싫어요 (id, review_id, user_id, like_type)
- `post_likes` - 게시글 좋아요/싫어요 (id, post_id, user_id, like_type)

**자동 변환 기능**:
- ✅ MySQL AUTO_INCREMENT → PostgreSQL SERIAL
- ✅ DATETIME → TIMESTAMP
- ✅ 외래 키 제약조건 유지
- ✅ 인덱스 자동 생성

---

#### 3️⃣ 초기 데이터 마이그레이션

**로컬 MySQL 데이터를 Render PostgreSQL로 이전:**

```bash
# 방법 1: 전체 마이그레이션 (권장)
node migrate_to_postgres.js

# 실행 결과
🚀 마이그레이션 시작...
✅ MySQL 연결 성공
✅ PostgreSQL 연결 성공
👥 users: 2개 사용자 마이그레이션 완료
⭐ reviews: 1개 리뷰 마이그레이션 완료
📝 posts: 1개 게시글 마이그레이션 완료
💬 comments: 1개 댓글 마이그레이션 완료
🎉 마이그레이션 완료!
```

**특징**:
- ✅ 모든 테이블 데이터 자동 복사
- ✅ rating 필드 자동 형변환 (문자열→정수)
- ✅ 시퀀스(Auto Increment) 자동 리셋
- ✅ 외래 키 관계 유지

---

#### 4️⃣ Render Web Service 생성 및 배포

**Render 대시보드 설정:**

```bash
1. New + → Web Service 선택
2. GitHub 저장소 연결: happymachine55/AI-MovieReview
3. 기본 설정:
   - Name: AI-MovieReview
   - Region: Singapore
   - Branch: main
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node app.js
   - Plan: Free

4. Environment 탭에서 환경 변수 추가:
   - DATABASE_URL = (PostgreSQL Internal URL 복사 붙여넣기)
   - GEMINI_API_KEY = (Google AI Studio에서 발급받은 키)
   - NODE_ENV = production

5. Create Web Service 클릭
```

**배포 로그 확인** (Logs 탭):
```
==> Building on host: ...
==> Downloading cache...
==> Installing dependencies...
==> Build successful!
==> Starting service...
✅ PostgreSQL 연결 준비 완료
Server running on port 10000
==> Your service is live 🎉
==> Available at your primary URL https://ai-moviereview.onrender.com
```

---

#### 5️⃣ CI/CD 자동 배포

**GitHub 연동으로 자동 배포:**

```bash
# 로컬에서 코드 수정 후
git add .
git commit -m "feat: Add new feature"
git push origin main

# Render가 자동으로:
# 1. GitHub 변경 감지
# 2. npm install 실행
# 3. node app.js로 서버 재시작
# 4. 새 버전 배포 완료 (약 2-3분)
```

**주의사항**:
- ✅ **코드 변경**: 자동 배포됨
- ⚠️ **환경 변수 변경**: Render 대시보드에서 수동 수정 필요
- ⚠️ **테이블 구조 변경**: `create_tables.js` 수동 실행 필요
- ⚠️ **데이터 추가**: 양방향 동기화 스크립트 사용 (아래 참조)

---

### 🔄 양방향 실시간 동기화

**로컬 MySQL**과 **Render PostgreSQL** 간 완전 양방향 동기화 시스템입니다.

#### 동기화 구조

```
로컬 MySQL ←――――――――――→ Render PostgreSQL
     ↓                        ↓
realtime_sync.js    sync_postgres_to_mysql.js
  (5초마다)              (10초마다)
```

#### 정방향 동기화 (MySQL → PostgreSQL)

**목적**: MySQL Workbench에서 작업한 내용을 Render에 자동 반영

```bash
# 실행 방법
node realtime_sync.js

# 실행 결과
╔════════════════════════════════════════════════╗
║  MySQL → PostgreSQL 실시간 동기화 시작         ║
╚════════════════════════════════════════════════╝
⏱️  동기화 주기: 5초
🔗 PostgreSQL: dpg-xxxxx.singapore-postgres.render.com
🔗 MySQL: localhost/gallery_movie
💡 종료하려면 Ctrl+C를 누르세요

🔄 동기화 시작...
📊 users: 1개의 새로운 레코드 발견
✅ 동기화 완료: 1개 추가/수정, 0개 삭제
⏰ 다음 동기화: 5초 후
```

**지원 기능**:
- ✅ INSERT (추가): 새 데이터 자동 감지 및 추가
- ✅ DELETE (삭제): 삭제된 데이터 자동 감지 및 삭제
- ⚠️ UPDATE (수정): 미지원 (created_at 기준 감지)

#### 역방향 동기화 (PostgreSQL → MySQL)

**목적**: Render 사이트에서 사용자가 작성한 내용을 로컬 MySQL에 백업

```bash
# 실행 방법
node sync_postgres_to_mysql.js

# 실행 결과
╔════════════════════════════════════════════════╗
║  PostgreSQL → MySQL 역방향 동기화 시작         ║
╚════════════════════════════════════════════════╝
⏱️  동기화 주기: 10초
🔗 PostgreSQL: dpg-xxxxx.singapore-postgres.render.com
🔗 MySQL: localhost/gallery_movie

🔄 역방향 동기화 시작...
📊 reviews: 2개의 새로운 레코드 발견
✅ 역방향 동기화 완료: 2개 추가/수정, 0개 삭제
⏰ 다음 동기화: 10초 후
```

**사용 시나리오**:
1. 사용자가 https://ai-moviereview.onrender.com 접속
2. 로그인 후 영화 리뷰 작성
3. PostgreSQL에 즉시 저장
4. 10초 후 → 로컬 MySQL에 자동 백업

#### 백그라운드 실행 (PM2 권장)

```bash
# PM2 설치
npm install -g pm2

# 양방향 동기화 시작
pm2 start realtime_sync.js --name "mysql-to-pg"
pm2 start sync_postgres_to_mysql.js --name "pg-to-mysql"

# 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 중지
pm2 stop all

# 재시작
pm2 restart all
```

#### 동기화 주기 설정

`.env` 파일에 추가:

```properties
# MySQL → PostgreSQL 주기 (기본: 5000ms = 5초)
SYNC_INTERVAL=5000

# PostgreSQL → MySQL 주기 (기본: 10000ms = 10초)
REVERSE_SYNC_INTERVAL=10000
```

**권장 설정**:
- 개발 중: 5초/10초 (빠른 피드백)
- 일반 사용: 10초/15초 (안정적)
- 저사양 PC: 20초/30초 (부하 감소)

---

### �️ 개발 워크플로우

#### 상황별 작업 흐름

**1. 코드만 수정 (UI, 로직 변경)**

```bash
# 로컬에서 개발 및 테스트
node app.js

# GitHub 푸시
git add .
git commit -m "fix: Bug fix"
git push origin main

# Render 자동 재배포 (2-3분)
# 완료!
```

**2. 로컬에서 데이터 추가 (MySQL Workbench)**

```bash
# MySQL Workbench에서 데이터 추가
INSERT INTO reviews (...) VALUES (...);

# 옵션 A: 실시간 동기화 스크립트 실행 중이면
# → 5초 후 자동으로 Render PostgreSQL에 반영

# 옵션 B: 수동 동기화
node migrate_to_postgres.js
```

**3. Render 사이트에서 사용자가 데이터 추가**

```bash
# 사용자가 https://ai-moviereview.onrender.com에서 리뷰 작성
# → PostgreSQL에 즉시 저장

# 역방향 동기화 스크립트 실행 중이면
# → 10초 후 로컬 MySQL에 자동 백업

# 수동 백업 (필요시)
# 역방향 동기화는 자동이므로 불필요
```

**4. 테이블 구조 변경 (컬럼 추가/삭제)**

```bash
# MySQL Workbench에서 테이블 수정
ALTER TABLE posts ADD COLUMN new_field VARCHAR(255);

# PostgreSQL에 반영
node create_tables.js

# 코드 수정 (필요시)
git add .
git commit -m "feat: Add new field"
git push origin main
```

---

### � 주요 스크립트

| 스크립트                       | 기능                                 | 사용 시기                    |
| ------------------------------ | ------------------------------------ | ---------------------------- |
| `create_tables.js`             | PostgreSQL 테이블 생성               | 최초 배포, 테이블 구조 변경  |
| `migrate_to_postgres.js`       | MySQL → PostgreSQL 데이터 마이그레이션 | 초기 데이터 이전             |
| `realtime_sync.js`             | MySQL → PostgreSQL 실시간 동기화 (정방향) | 로컬 개발 중 데이터 자동 반영 |
| `sync_postgres_to_mysql.js`    | PostgreSQL → MySQL 실시간 동기화 (역방향) | Render 데이터 로컬 백업       |
| `fix_mysql_posts.js`           | MySQL 테이블 구조 자동 수정          | 컬럼 누락 오류 발생 시       |

**실행 방법**:

```bash
# .env 파일에 POSTGRES_URL 설정 필수
node <스크립트명>
```

---

### 📖 상세 문서

- 📘 [양방향 동기화 가이드](BIDIRECTIONAL_SYNC_GUIDE.md) - 완전 양방향 실시간 동기화
- 📗 [실시간 동기화 가이드](REALTIME_SYNC_GUIDE.md) - MySQL → PostgreSQL 자동화
- 📙 [배포 가이드](DEPLOYMENT_GUIDE.md) - Render 배포 상세 설명
- 📕 [데이터 동기화 가이드](DATA_SYNC_GUIDE.md) - 수동 마이그레이션 방법

---

### ⚙️ 환경 비교

| 항목               | 로컬 개발 환경         | Render 프로덕션 환경                |
| ------------------ | ---------------------- | ----------------------------------- |
| **데이터베이스**   | MySQL 8.0.41           | PostgreSQL 15                       |
| **포트**           | 3000                   | 10000 (자동 할당)                   |
| **환경 변수**      | `.env` 파일            | Render 대시보드 설정                |
| **데이터 관리**    | MySQL Workbench        | Node.js 스크립트 + 양방향 동기화    |
| **배포 방법**      | `node app.js`          | Git push → 자동 배포                |
| **URL**            | localhost:3000         | ai-moviereview.onrender.com         |
| **SSL/HTTPS**      | ❌                     | ✅ 자동 적용                        |
| **슬립 모드**      | ❌                     | ✅ 15분 미사용 시                   |
| **데이터 백업**    | 수동                   | ✅ 역방향 동기화로 자동 백업        |

**자동 DB 전환 로직** (`db.js`):

```javascript
// DATABASE_URL 환경 변수로 자동 판단
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  // PostgreSQL 사용 (Render 프로덕션)
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // MySQL 사용 (로컬 개발)
  const mysql = require('mysql2');
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
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

## 🔄 MySQL ↔ PostgreSQL 양방향 동기화

개발 환경(MySQL)과 프로덕션 환경(PostgreSQL) 간의 데이터를 자동으로 동기화할 수 있습니다.

### 동기화 방향

#### 1. MySQL → PostgreSQL (정방향)
**스크립트**: `realtime_sync.js`  
**용도**: 로컬 개발 데이터를 Render에 반영

```bash
node realtime_sync.js
```

**기능**:
- ✅ 5초마다 MySQL 변경사항 감지
- ✅ 새로 추가된 데이터 자동 동기화
- ✅ 삭제된 데이터 자동 제거

**예시**:
```sql
-- MySQL Workbench에서 실행
INSERT INTO reviews (user_id, movie_title, rating, content, recommend, created_at)
VALUES (5, '새 영화', 9, '정말 재미있어요!', '추천함', NOW());
```
→ 5초 후 Render PostgreSQL에 자동 추가 → Render 사이트에서 확인 가능

#### 2. PostgreSQL → MySQL (역방향)
**스크립트**: `sync_postgres_to_mysql.js`  
**용도**: Render 사이트에서 작성한 데이터를 로컬 MySQL에 저장

```bash
node sync_postgres_to_mysql.js
```

**기능**:
- ✅ 10초마다 PostgreSQL 변경사항 감지
- ✅ 사용자가 Render 사이트에서 작성한 리뷰/게시글/댓글 자동 저장
- ✅ 삭제된 데이터 자동 제거

**예시**:
1. https://ai-moviereview.onrender.com 접속
2. 로그인 후 영화 리뷰 작성: "이 영화 최고!" (평점 10)
3. 제출
→ 10초 후 로컬 MySQL에 자동 저장 → MySQL Workbench에서 확인 가능

### 양방향 동기화 실행 (권장)

터미널 2개를 열어서 동시 실행:

```bash
# 터미널 1: MySQL → PostgreSQL
node realtime_sync.js

# 터미널 2: PostgreSQL → MySQL
node sync_postgres_to_mysql.js
```

**또는 pm2로 백그라운드 실행**:

```bash
# pm2 설치
npm install -g pm2

# 양방향 동기화 시작
pm2 start realtime_sync.js --name "mysql-to-pg"
pm2 start sync_postgres_to_mysql.js --name "pg-to-mysql"

# 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 중지
pm2 stop all
```

### 지원 기능

| 작업 | MySQL → PostgreSQL | PostgreSQL → MySQL | 감지 시간 |
|------|-------------------|-------------------|----------|
| INSERT (추가) | ✅ | ✅ | 5-10초 |
| DELETE (삭제) | ✅ | ✅ | 5-10초 |
| UPDATE (수정) | ❌ | ❌ | 미지원* |

*UPDATE는 `created_at` 기반 감지 방식이라 지원되지 않습니다. 수정이 필요하면 삭제 후 재추가하거나 양쪽 DB를 수동으로 업데이트하세요.

### 동기화 주기 변경

`.env` 파일에 추가:

```env
# MySQL → PostgreSQL 주기 (기본: 5초)
SYNC_INTERVAL=5000

# PostgreSQL → MySQL 주기 (기본: 10초)
REVERSE_SYNC_INTERVAL=10000
```

---

## 📚 상세 가이드 문서

프로젝트에 포함된 상세 가이드 문서들:

### 배포 관련
- 📘 **DEPLOYMENT_GUIDE.md** - 전체 배포 프로세스 상세 가이드 (15-20분)
- 📗 **RENDER_DEPLOY.md** - Render 플랫폼 사용법 (20-30분)
- 📙 **DATA_SYNC_GUIDE.md** - MySQL ↔ PostgreSQL 데이터 동기화 (10-15분)

### 동기화 관련
- 📕 **BIDIRECTIONAL_SYNC_GUIDE.md** - 양방향 동기화 완전 가이드
- 📓 **REALTIME_SYNC_GUIDE.md** - 실시간 동기화 설정 및 사용법

### 읽는 순서 (초보자용)

1. **처음 배포**: DEPLOYMENT_GUIDE.md
2. **Render 플랫폼 이해**: RENDER_DEPLOY.md
3. **데이터 동기화**: BIDIRECTIONAL_SYNC_GUIDE.md

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
