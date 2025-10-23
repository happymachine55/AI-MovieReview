# 📘 DBeaver로 Render PostgreSQL 연결하기

## 🎯 목적

- Render PostgreSQL에 DBeaver로 연결
- `init_postgres.sql` 실행하여 테이블 생성
- 데이터 관리 및 쿼리 실행

---

## 📋 준비 사항

### Render에서 PostgreSQL 생성 (먼저!)

1. **Render 대시보드** 접속: https://dashboard.render.com
2. **"New +"** → **"PostgreSQL"** 클릭
3. 설정:
   ```
   Name: moviereview-db
   Database: gallery_movie
   Region: Singapore
   PostgreSQL Version: 15
   Plan: Free
   ```
4. **"Create Database"** 클릭
5. 생성 완료 대기 (1~2분)

### 연결 정보 복사

PostgreSQL 생성 후 → **"Info"** 탭에서 다음 정보 확인:

```
Hostname: dpg-xxxxxxxxxxxxx-a.singapore-postgres.render.com
Port: 5432
Database: gallery_movie
Username: gallery_movie_user
Password: xxxxxxxxxxxxxxxxxxxx
```

**또는 External Database URL 복사:**

```
postgresql://gallery_movie_user:password@dpg-xxxxx.singapore-postgres.render.com/gallery_movie
```

---

## 🔌 DBeaver 연결 설정

### Step 1: 새 연결 생성

1. **DBeaver 실행**
2. 좌측 상단 **"New Database Connection"** 클릭 (플러그 아이콘)
   - 또는 메뉴: `Database` → `New Database Connection`

### Step 2: PostgreSQL 선택

1. **PostgreSQL** 아이콘 클릭
2. **"Next"** 클릭

### Step 3: 연결 정보 입력

**Main 탭:**

```
Host: dpg-xxxxxxxxxxxxx-a.singapore-postgres.render.com
Port: 5432
Database: gallery_movie
Username: gallery_movie_user
Password: (Render에서 복사한 비밀번호)
```

**체크박스:**

- ✅ Show all databases
- ✅ Save password

### Step 4: SSL 설정 (중요!)

**"SSL" 탭 클릭:**

```
☑️ Use SSL
SSL mode: require
```

Render PostgreSQL은 SSL 필수입니다!

### Step 5: 드라이버 다운로드

1. **"Test Connection"** 클릭
2. 처음이면 **"Download"** 클릭 (PostgreSQL JDBC 드라이버)
3. 다운로드 완료 후 자동으로 테스트

### Step 6: 연결 완료

- ✅ **"Connected"** 메시지 확인
- **"Finish"** 클릭

---

## 📊 테이블 생성하기

### Step 1: SQL 에디터 열기

1. DBeaver 좌측 **"Database Navigator"**에서
2. `moviereview-db` → `Databases` → `gallery_movie` 우클릭
3. **"SQL Editor"** → **"New SQL Script"** 선택

### Step 2: init_postgres.sql 실행

1. 프로젝트의 **`init_postgres.sql`** 파일 열기
2. **전체 내용 복사**
3. DBeaver SQL 에디터에 **붙여넣기**
4. **Ctrl+Enter** 또는 상단 **"Execute SQL Statement"** (▶) 클릭

### Step 3: 테이블 확인

좌측 Navigator에서:

```
moviereview-db
  └─ Databases
      └─ gallery_movie
          └─ Schemas
              └─ public
                  └─ Tables
                      ├─ users
                      ├─ reviews
                      ├─ posts
                      ├─ comments
                      ├─ review_likes
                      └─ post_likes
```

테이블 6개가 보이면 성공! ✅

---

## 🔍 연결 테스트

### 간단한 쿼리 실행

```sql
-- 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- users 테이블 구조 확인
SELECT * FROM users LIMIT 1;
```

---

## 🐛 트러블슈팅

### 문제 1: "Connection refused" 오류

**원인:** SSL 미설정

**해결:**

1. 연결 설정 우클릭 → "Edit Connection"
2. SSL 탭 → "Use SSL" 체크
3. SSL mode: "require" 선택

### 문제 2: "Password authentication failed"

**원인:** 비밀번호 오류

**해결:**

1. Render 대시보드에서 비밀번호 재확인
2. 또는 "Reset Password" 후 새 비밀번호 입력

### 문제 3: "Database does not exist"

**원인:** 데이터베이스 이름 오류

**해결:**

- Database 이름을 정확히 `gallery_movie` 입력

### 문제 4: 드라이버 다운로드 실패

**해결:**

1. DBeaver 메뉴: `Database` → `Driver Manager`
2. PostgreSQL 선택 → "Download/Update" 클릭
3. 수동으로 다운로드

---

## 💡 유용한 팁

### 1. 여러 데이터베이스 연결 관리

DBeaver에서 동시에 관리 가능:

- ✅ 로컬 MySQL (localhost:3306)
- ✅ Render PostgreSQL (클라우드)

### 2. SQL 스크립트 저장

자주 쓰는 쿼리는 저장:

1. SQL 에디터에 쿼리 작성
2. 메뉴: `File` → `Save` → `backup_queries.sql`

### 3. 데이터 익스포트/임포트

**데이터 백업:**

1. 테이블 우클릭 → `Export Data`
2. Format: SQL INSERT

**데이터 복원:**

1. SQL 에디터에서 SQL 파일 실행

---

## 🎨 DBeaver 테마 설정 (선택)

보기 편한 다크 모드:

1. `Window` → `Preferences`
2. `General` → `Appearance`
3. Theme: `Dark`

---

## ✅ 완료 체크리스트

- [ ] Render PostgreSQL 생성
- [ ] DBeaver 연결 설정 (SSL 포함)
- [ ] 연결 테스트 성공
- [ ] `init_postgres.sql` 실행
- [ ] 테이블 6개 생성 확인
- [ ] 간단한 쿼리 테스트

모두 체크되면 Render 배포 준비 완료! 🎉
