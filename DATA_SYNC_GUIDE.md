# 🔄 MySQL ↔ PostgreSQL 데이터 동기화 가이드

## 📌 상황별 해결 방법

### 상황 1: 로컬 MySQL에서 데이터 추가/수정함

- 예: 새 사용자 추가, 리뷰 작성, 게시글 작성

### 상황 2: Render PostgreSQL에 반영 필요

- 로컬 테스트 데이터를 배포 서버에 동기화

---

## 🚀 방법 1: 완전 동기화 스크립트 (테이블 구조 + 데이터, 추천!)

**MySQL 테이블 구조가 변경되어도 자동으로 PostgreSQL에 반영!**

### 설정 (한 번만)

1. **.env 파일에 PostgreSQL URL 추가:**

```env
# 기존 MySQL 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1111
DB_NAME=gallery_movie

# Render PostgreSQL URL 추가
POSTGRES_URL=postgresql://user:password@dpg-xxxxx.singapore-postgres.render.com/gallery_movie

# API 키
GEMINI_API_KEY=your_gemini_api_key_here
```

**POSTGRES_URL 복사 방법:**

1. Render 대시보드 → PostgreSQL 서비스
2. "Info" 탭 → **Internal Database URL** 복사
3. .env 파일에 `POSTGRES_URL=` 뒤에 붙여넣기

### 실행

```bash
node sync_mysql_to_postgres.js
```

### 결과

```
============================================================
MySQL → PostgreSQL 완전 동기화 시작
============================================================

🔹 MySQL 연결 중...
✅ MySQL 연결 성공: gallery_movie

🔹 PostgreSQL 연결 중...
✅ PostgreSQL 연결 성공

🔹 MySQL 테이블 구조 분석 중...
   📊 6개 테이블 발견

🔹 기존 PostgreSQL 테이블 삭제 중...
✅ 기존 테이블 삭제 완료

🔹 테이블 "users" 동기화 중...
   📊 구조 생성 완료
   📊 10개 행 복사 중...
   📊 데이터 복사 완료
✅ "users" 동기화 완료

... (나머지 테이블도 동일)

🔹 인덱스 생성 중...
✅ 인덱스 생성 완료

🎉 동기화 완료!
```

### ✨ 이 스크립트의 특별한 점:

- ✅ **테이블 구조 자동 분석**: MySQL 테이블 구조를 읽어서 PostgreSQL에 재생성
- ✅ **데이터 타입 자동 변환**: MySQL → PostgreSQL 문법 자동 변환
- ✅ **외래 키/인덱스 유지**: 관계와 성능 최적화 모두 보존
- ✅ **ID 시퀀스 동기화**: AUTO_INCREMENT 값 맞춤

---

## 🔄 방법 2: 데이터만 마이그레이션 (테이블 구조는 유지)

### 설정 (한 번만)

1. **.env 파일에 PostgreSQL URL 추가:**

```env
# 기존 MySQL 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1111
DB_NAME=gallery_movie

# Render PostgreSQL URL 추가
POSTGRES_URL=postgresql://user:password@dpg-xxxxx.singapore-postgres.render.com/gallery_movie

# API 키
GEMINI_API_KEY=your_gemini_api_key_here
```

**POSTGRES_URL 복사 방법:**

1. Render 대시보드 → PostgreSQL 서비스
2. "Info" 탭 → **Internal Database URL** 복사
3. .env 파일에 `POSTGRES_URL=` 뒤에 붙여넣기

### 실행

```bash
node migrate_to_postgres.js
```

### 결과

```
╔════════════════════════════════════════════════════════════╗
║       MySQL → PostgreSQL 데이터 마이그레이션              ║
╚════════════════════════════════════════════════════════════╝

🚀 마이그레이션 시작...

📡 MySQL 연결 중...
✅ MySQL 연결 성공

📡 PostgreSQL 연결 중...
✅ PostgreSQL 연결 성공

👥 users 테이블 마이그레이션 중...
   📊 5개의 사용자 발견
   🗑️  기존 데이터 삭제
   ✅ 5개 사용자 마이그레이션 완료

⭐ reviews 테이블 마이그레이션 중...
   📊 12개의 리뷰 발견
   🗑️  기존 데이터 삭제
   ✅ 12개 리뷰 마이그레이션 완료

📝 posts 테이블 마이그레이션 중...
   📊 8개의 게시글 발견
   🗑️  기존 데이터 삭제
   ✅ 8개 게시글 마이그레이션 완료

🎉 마이그레이션 완료!
```

---

---

## 📝 방법 3: 수동 SQL 복사 (간단한 데이터용)

### Node.js로 직접 쿼리 실행

**간단한 데이터 추가일 경우:**

1. **새 스크립트 만들기** (예: `add_user.js`):

```javascript
require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function addUser() {
  await client.connect();

  // 데이터 추가
  await client.query(
    `
        INSERT INTO users (username, password) 
        VALUES ($1, $2)
    `,
    ["newuser", "hashed_password"]
  );

  console.log("✅ 사용자 추가 완료!");
  await client.end();
}

addUser();
```

2. **실행:**
   ```bash
   node add_user.js
   ```

---

## ⚡ 자주 묻는 질문

### Q1: 로컬에서 개발하고 배포할 때마다 마이그레이션 해야 하나요?

**A:** 개발 단계에서는 그렇습니다. 하지만:

**방법 A (추천):**

- 로컬에서 충분히 테스트한 후
- **마이그레이션 스크립트 한 번 실행**
- 이후 사용자가 직접 Render에서 데이터 입력

**방법 B:**

- Render 배포 후에는 **Render PostgreSQL이 메인**
- 로컬은 개발/테스트용으로만 사용

### Q2: 배포 후 사용자가 입력한 데이터는?

**A:** Render PostgreSQL에만 저장됩니다!

- 로컬 MySQL과 분리됨
- 프로덕션 데이터는 Render에만 존재

### Q3: 양방향 동기화는 안 되나요?

**A:** 현재는 MySQL → PostgreSQL 단방향만 지원

- 프로덕션(Render)과 개발(로컬)은 분리하는 게 일반적
- 필요시 PostgreSQL → MySQL 스크립트도 만들 수 있음

### Q4: 자동 동기화는 불가능한가요?

**A:** 가능하지만 복잡합니다:

- **실시간 동기화**: 데이터베이스 replication 필요
- **스케줄 동기화**: cron job으로 주기적 실행
- **일반적으로 불필요**: 개발/프로덕션 환경 분리가 표준

---

## 💡 권장 워크플로우

### 개발 단계 (현재)

```
로컬 개발
  ↓
MySQL에서 테스트
  ↓
마이그레이션 스크립트 실행 (1회)
  ↓
Render PostgreSQL 확인
  ↓
배포
```

### 운영 단계 (배포 후)

```
사용자 → Render PostgreSQL에 직접 데이터 입력
              ↓
         자동으로 저장됨
              ↓
         백업 필요 시 DBeaver로 export
```

---

## 🔄 실전 사용 예시

### 시나리오: 테스트 사용자 5명 추가

**1. 로컬 MySQL에서 작업:**

```sql
INSERT INTO users (username, password) VALUES
('test1', '$2b$10$hashed...'),
('test2', '$2b$10$hashed...'),
('test3', '$2b$10$hashed...'),
('test4', '$2b$10$hashed...'),
('test5', '$2b$10$hashed...');
```

**2. 마이그레이션 실행:**

```bash
node migrate_to_postgres.js
```

**3. 완료!**

```
✅ 5개 사용자 마이그레이션 완료
```

---

## ⚠️ 주의사항

### 1. 데이터 덮어쓰기

**마이그레이션 스크립트는 PostgreSQL 데이터를 삭제하고 MySQL 데이터로 대체합니다!**

```javascript
await pgClient.query("TRUNCATE TABLE users CASCADE");
// 기존 PostgreSQL 데이터 전부 삭제!
```

**해결책:**

- 프로덕션 데이터 백업 후 실행
- 또는 `TRUNCATE` 줄 주석 처리하고 `ON CONFLICT DO UPDATE` 사용

### 2. ID 충돌

**MySQL과 PostgreSQL ID가 겹치면?**

스크립트가 자동으로 시퀀스 리셋:

```javascript
SELECT setval('users_id_seq', MAX(id))
```

### 3. 비밀번호 해시

**bcrypt 해시는 그대로 복사됨**

- MySQL → PostgreSQL 이동 시 비밀번호 작동함
- 재해시 불필요

---

## 🛠️ 트러블슈팅

### 문제: "POSTGRES_URL is not defined"

**해결:**

```bash
# .env 파일에 추가
POSTGRES_URL=postgresql://user:pass@host/db
```

### 문제: "Connection refused"

**원인:** Render PostgreSQL SSL 필요

**해결:** 이미 스크립트에 포함됨:

```javascript
ssl: {
  rejectUnauthorized: false;
}
```

### 문제: "Sequence out of sync"

**원인:** ID가 겹침

**해결:** 스크립트가 자동으로 시퀀스 리셋

- 또는 수동: `SELECT setval('users_id_seq', 100);`

---

## 📚 요약

| 방법                      | 장점                      | 단점                      | 추천       |
| ------------------------- | ------------------------- | ------------------------- | ---------- |
| **마이그레이션 스크립트** | 자동화, 빠름, 전체 데이터 | 일방향만 지원             | ⭐⭐⭐⭐⭐ |
| **DBeaver Export/Import** | GUI 편함, 선택적 이전     | 수동 작업, 문법 수정 필요 | ⭐⭐⭐     |
| **수동 복사**             | 간단한 데이터에 적합      | 많은 데이터는 비현실적    | ⭐⭐       |

**결론:** 개발 완료 후 **마이그레이션 스크립트 1회 실행** 추천!

---

## 🎓 베스트 프랙티스

### 개발 환경

```
로컬 MySQL (localhost:3306)
  ↓ 개발/테스트
초기 데이터 입력
```

### 배포 전

```
node migrate_to_postgres.js
  ↓ 1회 실행
Render PostgreSQL에 데이터 복사
```

### 운영 환경

```
Render PostgreSQL (프로덕션)
  ↓ 사용자 직접 입력
실제 데이터 축적
```

**핵심:** 배포 후에는 Render가 메인, 로컬은 개발용!

---

궁금한 점 있으면 언제든 물어보세요! 🙋‍♂️
