# 📘 ~~DBeaver로 Render PostgreSQL 연결하기~~ (더 이상 사용 안 함!)

## ⚠️ 이 가이드는 더 이상 사용하지 않습니다!

**대신 Node.js 스크립트를 사용하세요!**

- ✅ **DBeaver 설치 불필요**
- ✅ **PostgreSQL 로컬 설치 불필요**
- ✅ **더 빠르고 안정적**

---

## 🚀 새로운 방법: Node.js 스크립트 사용

### 1. 테이블 생성

```bash
# .env 파일에 POSTGRES_URL 추가
node create_tables.js
```

### 2. 데이터 동기화 (MySQL → PostgreSQL)

```bash
# 테이블 구조 + 데이터 모두 동기화
node sync_mysql_to_postgres.js

# 또는 데이터만 동기화
node migrate_to_postgres.js
```

### 3. 장점

- ✅ 설치 프로그램 없이 Node.js만으로 모든 작업 가능
- ✅ 스크립트로 자동화되어 실수 방지
- ✅ 연결 문제 없음 (SSL 자동 처리)
- ✅ 로그로 진행 상황 확인 가능

---

## 📚 관련 문서

더 자세한 내용은 다음 가이드를 참고하세요:

- **배포 가이드**: `RENDER_DEPLOY.md`
- **데이터 동기화**: `DATA_SYNC_GUIDE.md`
- **전체 배포 가이드**: `DEPLOYMENT_GUIDE.md`

---

## 💡 왜 DBeaver를 사용하지 않나요?

1. **연결 문제**: DBeaver와 Render PostgreSQL 17.x 호환 문제
2. **복잡함**: GUI 설정보다 스크립트가 더 간단
3. **자동화**: 스크립트는 재실행 가능, DBeaver는 수동 작업
4. **설치 불필요**: Node.js만 있으면 됨

---

<details>
<summary>📖 아카이브: 이전 DBeaver 가이드 (참고용)</summary>

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

**⚠️ 중요: URL 직접 붙여넣기 하지 마세요!**

Render의 **External Database URL**을 복사했다면:

```
postgresql://gallery_movie_user:60qe9Z60FWlZ...@dpg-d3ss6nq4d50c73eka5g0-a.singapore-postgres.render.com/gallery_movie
```

이 URL을 **각 필드로 분리**해서 입력해야 합니다!

**Main 탭:**

| 필드           | 값                    | 예시                                               |
| -------------- | --------------------- | -------------------------------------------------- |
| **Connect by** | `Host` 선택 (기본값)  | ⚪ Host ⭕ URL                                     |
| **Host**       | `@` 뒤, `/` 앞 부분   | `dpg-xxxxxxxxxxxx-a.singapore-postgres.render.com` |
| **Port**       | 기본값                | `5432`                                             |
| **Database**   | URL 맨 끝 부분        | `gallery_movie`                                    |
| **Username**   | `://` 뒤, `:` 앞 부분 | `gallery_movie_user`                               |
| **Password**   | `:` 뒤, `@` 앞 부분   | `60qe9Z60FWlZboU9b1pH...`                          |

**URL 파싱 방법:**

```
postgresql://gallery_movie_user:60qe9Z60FWlZ...@dpg-xxxxx.singapore-postgres.render.com/gallery_movie
           └─────Username────┘└───Password───┘└────────────Host──────────────────┘└─Database─┘
```

**✅ 당신의 실제 입력값 (스크린샷 기준):**

```
Host: dpg-d3ss6nq4d50c73eka5g0-a.singapore-postgres.render.com
Port: 5432
Database: gallery_movie
Username: gallery_movie_user
Password: 60qe9Z60FWlZboU9b1pHWOIunm5yjt7b@dpg-d3ss6nq4d50c73eka5g0-a (← 틀림! 아래 참고)
```

**⚠️ Password는 `@` 앞까지만!**

```
올바른 Password: 60qe9Z60FWlZboU9b1pHWOIunm5yjt7b
틀린 Password: 60qe9Z60FWlZboU9b1pHWOIunm5yjt7b@dpg-d3ss6nq4d50c73eka5g0-a...
                                                └──── 여기부터는 Host!
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

### 문제 2: "Unable to parse URL" (당신의 에러!)

**에러 메시지:**

```
Unable to parse URL jdbc:postgresql://postgresql://gallery_movie_user:60qe9...
```

**원인:** URL이 중복되거나 잘못된 형식으로 입력됨

**해결 방법:**

1. **"Connect by"가 "URL"로 선택되어 있는지 확인**
   - ⚠️ **"Host"로 변경하세요!**
2. **Main 탭에서 각 필드 개별 입력:**

```
Connect by: Host (← 중요!)
Host: dpg-d3ss6nq4d50c73eka5g0-a.singapore-postgres.render.com
Port: 5432
Database: gallery_movie
Username: gallery_movie_user
Password: 60qe9Z60FWlZboU9b1pHWOIunm5yjt7b (← @dpg... 제외!)
```

3. **URL 필드는 비워두세요!**
   - DBeaver가 자동으로 생성합니다

### 문제 3: "Password authentication failed"

**원인:** 비밀번호 오류

**해결:**

1. Render 대시보드에서 비밀번호 재확인
2. Password에 `@dpg-...` 부분이 포함되지 않았는지 확인
3. 또는 "Reset Password" 후 새 비밀번호 입력

### 문제 4: "Database does not exist"

**원인:** 데이터베이스 이름 오류

**해결:**

- Database 이름을 정확히 `gallery_movie` 입력

### 문제 5: Port가 URL에 포함된 경우

**잘못된 URL 복사:**

```
postgresql://...@host:5432/gallery_movie
```

**해결:** Port는 URL에서 제외하고 별도 필드에 입력

```
Host: dpg-xxx.singapore-postgres.render.com (← :5432 제외!)
Port: 5432 (← 별도 입력)
```

### 문제 6: 드라이버 다운로드 실패

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

DBeaver 관련 설정들...

</details>

---

## ✅ 최종 정리

**DBeaver 사용하지 마세요!** 대신:

1. **테이블 생성**: `node create_tables.js`
2. **데이터 동기화**: `node sync_mysql_to_postgres.js`
3. **배포**: Render 대시보드에서 Web Service 생성

**끝!** 😊
