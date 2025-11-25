# VS Code PostgreSQL 확장 연결 가이드

## 🎯 현재 상황

- ✅ PostgreSQL 15 서비스 실행 중
- ✅ 포트 5432에서 대기 중
- ❌ VS Code 확장에서 연결 실패

---

## 🔧 해결 방법

### 방법 1: VS Code PostgreSQL 확장 설정 (화면에 보이는 것)

#### 1단계: 연결 정보 입력

현재 열려있는 VS Code 연결 창에서:

```
서버 이름: localhost
포트: 5432
데이터베이스: gallery_movie_local
사용자 이름: postgres
암호: 1111
SSL 모드: disable (또는 prefer)
```

#### 2단계: "연결 저장" 체크 ✅

#### 3단계: "연결" 버튼 클릭

---

### 방법 2: VS Code Settings로 직접 설정

#### 1. VS Code 설정 열기

- `Ctrl + ,` (설정)
- 검색창에 `postgresql` 입력

#### 2. settings.json 편집

`Ctrl + Shift + P` → "Preferences: Open User Settings (JSON)"

```json
{
  "postgresql.connections": [
    {
      "name": "Local PostgreSQL",
      "host": "localhost",
      "port": 5432,
      "database": "gallery_movie_local",
      "user": "postgres",
      "password": "1111",
      "ssl": false
    }
  ]
}
```

---

### 방법 3: 명령줄로 연결 테스트

PowerShell에서:

```powershell
# psql이 설치되어 있는지 확인
psql --version

# 연결 테스트
psql -h localhost -p 5432 -U postgres -d gallery_movie_local

# 비밀번호 입력: 1111
```

연결되면 다음 명령으로 테이블 확인:

```sql
\dt
\d users
\d feedbacks
\q  # 종료
```

---

## 🐛 연결 실패 시 문제 해결

### 문제 1: "암호 인증 실패"

**원인:** postgres 사용자의 비밀번호가 다름

**해결:**

```powershell
# Windows에서 postgres 사용자 비밀번호 재설정
psql -U postgres

# psql 프롬프트에서:
ALTER USER postgres WITH PASSWORD '1111';
\q
```

### 문제 2: "데이터베이스 'gallery_movie_local'이 존재하지 않음"

**해결:**

```sql
-- 데이터베이스 생성
CREATE DATABASE gallery_movie_local;

-- 데이터베이스 목록 확인
\l
```

### 문제 3: "호스트에 연결할 수 없음"

**원인:** PostgreSQL이 localhost 연결을 허용하지 않음

**해결:** `pg_hba.conf` 파일 수정

```
# 파일 위치: C:\Program Files\PostgreSQL\15\data\pg_hba.conf

# 다음 라인 추가 또는 확인:
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

수정 후 PostgreSQL 재시작:

```powershell
Restart-Service postgresql-x64-15
```

---

## ✅ 연결 확인 쿼리

연결 성공 후 실행할 쿼리들:

```sql
-- 1. 현재 데이터베이스 확인
SELECT current_database();

-- 2. 모든 테이블 목록
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- 3. users 테이블 구조 확인
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 4. profile_image 컬럼 존재 확인
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'profile_image';

-- 5. feedbacks 테이블 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'feedbacks'
ORDER BY ordinal_position;

-- 6. 데이터 개수 확인
SELECT
  (SELECT COUNT(*) FROM users) as user_count,
  (SELECT COUNT(*) FROM feedbacks) as feedback_count,
  (SELECT COUNT(*) FROM posts) as post_count,
  (SELECT COUNT(*) FROM reviews) as review_count;
```

---

## 📝 필요한 경우: 테이블 생성

만약 테이블이 없다면:

```sql
-- users 테이블에 profile_image 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);

-- feedbacks 테이블 생성
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created_at DESC);
```

---

## 🎯 다음 단계

연결 성공 후:

1. ✅ 테이블 구조 확인
2. ✅ 누락된 컬럼/테이블 추가
3. ✅ 프로필 이미지 & 피드백 기능 구현
4. ✅ 테스트
