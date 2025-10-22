# 🚂 Railway 배포 가이드

## 📋 배포 전 체크리스트

### ✅ 완료된 설정
- [x] `package.json`에 start 스크립트 추가
- [x] 동적 PORT 설정 (`process.env.PORT`)
- [x] `railway.json` 설정 파일 생성
- [x] `Procfile` 생성
- [x] `.gitignore` 업데이트

## 🔧 Railway 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 **반드시** 설정해야 합니다:

### 1. 데이터베이스 설정
```
DB_HOST=<Railway MySQL 호스트 주소>
DB_USER=<데이터베이스 사용자명>
DB_PASSWORD=<데이터베이스 비밀번호>
DB_NAME=gallery_movie
```

### 2. API 키 설정
```
GEMINI_API_KEY=AIzaSyA7F_lOhtM7DDYxATLrcc9A2AwvNv7vpUQ
```

### 3. 세션 보안 키 (선택)
```
SESSION_SECRET=your-production-secret-key-change-this
```

---

## 🗄️ Railway에서 MySQL 데이터베이스 추가하기

### 방법 1: Railway MySQL 플러그인 사용 (추천)

1. **Railway 프로젝트 대시보드** 접속
2. **"New" → "Database" → "Add MySQL"** 클릭
3. 자동으로 MySQL 인스턴스 생성됨
4. **Variables 탭**에서 연결 정보 확인:
   - `MYSQLHOST` → `DB_HOST`로 복사
   - `MYSQLUSER` → `DB_USER`로 복사
   - `MYSQLPASSWORD` → `DB_PASSWORD`로 복사
   - `MYSQLDATABASE` → `DB_NAME`으로 복사

### 방법 2: 외부 MySQL 사용 (PlanetScale, AWS RDS 등)

외부 데이터베이스를 사용하는 경우:
1. 해당 서비스에서 연결 정보 확인
2. Railway 환경 변수에 입력

---

## 📊 데이터베이스 초기 설정

### 1. Railway MySQL에 연결

Railway에서 제공하는 MySQL CLI 또는 외부 클라이언트 사용:

```bash
# Railway CLI 사용
railway connect mysql

# 또는 MySQL Workbench 등으로 연결
Host: <MYSQLHOST 값>
Port: <MYSQLPORT 값>
User: <MYSQLUSER 값>
Password: <MYSQLPASSWORD 값>
```

### 2. 테이블 생성 SQL 실행

다음 순서대로 테이블 생성:

```sql
-- 1. 데이터베이스 생성 (이미 생성되어 있을 수 있음)
CREATE DATABASE IF NOT EXISTS gallery_movie;
USE gallery_movie;

-- 2. users 테이블
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. movies 테이블
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    director VARCHAR(100),
    genre VARCHAR(50),
    release_year INT,
    poster_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. reviews 테이블
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_title VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 10),
    content TEXT,
    recommend VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INT DEFAULT 0,
    dislikes_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. posts 테이블
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    views INT DEFAULT 0,
    recommend INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INT DEFAULT 0,
    dislikes_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. comments 테이블
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. review_likes 테이블
CREATE TABLE review_likes (
    id INT NOT NULL AUTO_INCREMENT,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    like_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_review (review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. post_likes 테이블
CREATE TABLE post_likes (
    id INT NOT NULL AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    like_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_post (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🚀 배포 단계별 가이드

### Step 1: GitHub에 코드 푸시

```bash
git add .
git commit -m "Railway 배포 준비 완료"
git push origin main
```

### Step 2: Railway 프로젝트 설정

1. **Railway 대시보드** 접속 (railway.app)
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. **저장소 선택**: `happymachine55/AI-MovieReview`
5. 자동으로 빌드 시작

### Step 3: 환경 변수 설정

1. 프로젝트 클릭 → **"Variables"** 탭
2. 위의 환경 변수들 입력
3. **"Deploy"** 클릭하여 재배포

### Step 4: MySQL 데이터베이스 추가

1. **"New" → "Database" → "Add MySQL"**
2. 생성된 MySQL의 Variables 확인
3. 프로젝트의 환경 변수에 DB 정보 입력

### Step 5: 데이터베이스 테이블 생성

1. MySQL 연결 후 위의 SQL 실행
2. 초기 데이터 입력 (필요시)

---

## 🔍 배포 후 확인 사항

### 1. 배포 성공 확인
- Railway 대시보드에서 **"Deployments"** 탭 확인
- 상태가 **"Success"**인지 확인

### 2. 로그 확인
```
Server running on port XXXX
```
메시지가 있는지 확인

### 3. 웹사이트 접속
- Railway에서 제공하는 URL로 접속
- 예: `https://ai-moviereview-production.up.railway.app`

### 4. 기능 테스트
- [ ] 회원가입 작동
- [ ] 로그인 작동
- [ ] 영화 목록 표시
- [ ] 리뷰 작성/좋아요
- [ ] 게시글 작성/좋아요
- [ ] AI 리뷰 생성 (Gemini API)

---

## ⚠️ 주의사항

### 1. bcrypt 빌드 오류 발생 시
Railway는 자동으로 네이티브 모듈을 빌드합니다. 
만약 오류가 발생하면:

```json
// package.json에 추가
"engines": {
  "node": ">=18.x",
  "npm": ">=9.x"
}
```

### 2. 세션 스토어 설정 (선택)
프로덕션 환경에서는 메모리 기반 세션 대신 Redis 사용 권장:

```bash
railway add redis
```

### 3. CORS 설정 (필요시)
프론트엔드를 별도 도메인에서 호스팅하는 경우:

```javascript
// app.js에 추가
const cors = require('cors');
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

## 🐛 트러블슈팅

### "Error: creating build plan with Railpack" 오류
→ **해결**: `railway.json`과 `package.json` 확인 (이미 수정됨)

### 데이터베이스 연결 오류
→ **확인 사항**:
- 환경 변수가 올바르게 설정되었는지
- MySQL 서비스가 실행 중인지
- 방화벽 설정 확인

### 포트 오류
→ **해결**: `process.env.PORT` 사용 (이미 수정됨)

### bcrypt 설치 오류
→ **해결**: Node.js 18 이상 사용 (package.json에 명시됨)

---

## 📱 모바일 접속

Railway는 자동으로 HTTPS를 제공하므로 모바일에서도 안전하게 접속 가능합니다.

---

## 💰 비용 관련

- **Railway 무료 티어**: $5 크레딧/월 제공
- **예상 사용량**: 
  - 웹 서비스: ~$3/월
  - MySQL: ~$2/월
  
**총 예상 비용**: 무료 크레딧 내에서 운영 가능!

---

## 📞 도움말

- Railway 공식 문서: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/happymachine55/AI-MovieReview/issues

---

## ✅ 배포 완료 후

배포가 성공하면 Railway URL을 README.md에 추가하세요!

```markdown
## 🌐 Live Demo
https://your-app-name.up.railway.app
```

🎉 배포 성공을 축하합니다!
