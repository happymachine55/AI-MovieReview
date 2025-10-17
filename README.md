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

- **김원묵** : 팀장, 백엔드/프론트엔드 개발
- **서한별** : 기획자, UI/UX 디자인

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

- 품목 별 랭킹 조회
  - 기존의 에너지효율 등급과 탄소배출량 등을 고려하여 매긴 자체점수를 이용해 가전제품의 랭킹을 사용자에게 보여준다.
  - 기존의 에너지효율 등급만으로는 동일한 등급 간의 비교가 어려웠고, 얼마만큼의 이득이 생기는지가 수치적으로 드러나지 않는다는 단점이 존재했다. 이러한 점을 개선하기 위해 자체 점수 제도를 도입하였다.
  - 또한 등급간의 비율도 가전기기의 종류마다 제각각이었기 때문에 인공지능을 활용해 공평하게 등급을 구분하였다면

## ✒️ API

- API 상세설명 : <>

- API 명세서 : <>
