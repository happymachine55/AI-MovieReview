# 🔄 완전 양방향 동기화 가이드

## 개요

MySQL(로컬)과 PostgreSQL(Render) 간의 **완전 양방향 실시간 동기화** 시스템입니다.

## 동기화 방향

### 1. MySQL → PostgreSQL (정방향)

**스크립트**: `realtime_sync.js`  
**목적**: 로컬 MySQL Workbench에서의 변경사항을 Render PostgreSQL에 반영

- ✅ MySQL에서 추가한 데이터 → PostgreSQL에 자동 추가
- ✅ MySQL에서 삭제한 데이터 → PostgreSQL에서 자동 삭제

### 2. PostgreSQL → MySQL (역방향)

**스크립트**: `sync_postgres_to_mysql.js`  
**목적**: 사용자가 Render 사이트에서 작성한 내용을 로컬 MySQL에 반영

- ✅ Render 사이트에서 작성한 리뷰/게시글/댓글 → MySQL에 자동 저장
- ✅ Render에서 삭제한 데이터 → MySQL에서 자동 삭제

## 사용 방법

### 방법 1: 두 스크립트 동시 실행 (완전 양방향)

**터미널 1**:

```bash
node realtime_sync.js
```

**터미널 2**:

```bash
node sync_postgres_to_mysql.js
```

### 방법 2: PM2로 백그라운드 실행 (권장)

```bash
# pm2 설치 (최초 1회)
npm install -g pm2

# 양방향 동기화 시작
pm2 start realtime_sync.js --name "mysql-to-pg"
pm2 start sync_postgres_to_mysql.js --name "pg-to-mysql"

# 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 특정 프로세스 로그만 보기
pm2 logs mysql-to-pg
pm2 logs pg-to-mysql

# 중지
pm2 stop all

# 재시작
pm2 restart all

# 삭제
pm2 delete all
```

## 동작 예시

### 시나리오 1: MySQL Workbench에서 작업

```sql
-- MySQL Workbench에서 실행
INSERT INTO reviews (user_id, movie_title, rating, content, recommend, created_at)
VALUES (5, '새 영화', 9, '정말 재미있어요!', '추천함', NOW());
```

**결과**:

- 5초 후 → ✅ Render PostgreSQL에 자동 추가
- → ✅ Render 사이트에서 해당 리뷰 확인 가능

### 시나리오 2: Render 사이트에서 작업

사용자가 https://ai-moviereview.onrender.com 에서:

1. 로그인
2. 영화 리뷰 작성: "이 영화 최고!" (평점 10)
3. 제출

**결과**:

- ✅ PostgreSQL에 즉시 저장
- 10초 후 → ✅ 로컬 MySQL에 자동 추가
- → ✅ MySQL Workbench에서 해당 리뷰 확인 가능

### 시나리오 3: 양쪽에서 동시 작업

- **MySQL**: user1이 게시글 작성
- **Render**: user2가 댓글 작성

**결과**:

- user1의 게시글 → PostgreSQL에 동기화 → Render 사이트에 표시
- user2의 댓글 → MySQL에 동기화 → MySQL Workbench에서 확인 가능

## 설정

### 동기화 주기 변경

`.env` 파일에 추가:

```properties
# MySQL → PostgreSQL 주기 (기본: 5초)
SYNC_INTERVAL=5000

# PostgreSQL → MySQL 주기 (기본: 10초)
REVERSE_SYNC_INTERVAL=10000
```

**권장 설정**:

- **개발 중**: 5000-10000ms (빠른 피드백)
- **일반 사용**: 10000-15000ms (안정적)
- **저사양 PC**: 20000-30000ms (부하 감소)

## 지원 기능

| 작업          | MySQL → PostgreSQL | PostgreSQL → MySQL | 감지 시간 |
| ------------- | ------------------ | ------------------ | --------- |
| INSERT (추가) | ✅                 | ✅                 | 5-10초    |
| DELETE (삭제) | ✅                 | ✅                 | 5-10초    |
| UPDATE (수정) | ❌                 | ❌                 | 미지원    |

## 제한사항

### UPDATE (수정) 미지원

**이유**: MySQL과 PostgreSQL 모두 `updated_at` 컬럼이 없음

**해결 방법**:

1. **수동 동기화**: 수정 후 양쪽 DB 모두 업데이트
2. **삭제 후 재추가**: 기존 레코드 삭제 → 새로 추가 (자동 동기화됨)

## 모니터링

### 정방향 동기화 (MySQL → PostgreSQL)

```
╔════════════════════════════════════════════════════════════╗
║       MySQL → PostgreSQL 실시간 동기화 시작               ║
╚════════════════════════════════════════════════════════════╝

🔄 동기화 시작...
📊 reviews: 1개의 새로운 레코드 발견
✅ 동기화 완료: 1개 추가/수정, 0개 삭제
⏰ 다음 동기화: 5초 후
```

### 역방향 동기화 (PostgreSQL → MySQL)

```
╔════════════════════════════════════════════════════════════╗
║   PostgreSQL(Render) → MySQL(로컬) 역방향 동기화 시작    ║
╚════════════════════════════════════════════════════════════╝

🔄 역방향 동기화 시작 (PostgreSQL → MySQL)...
📊 posts: 1개의 새로운 레코드 발견 (PostgreSQL → MySQL)
✅ 역방향 동기화 완료: 1개 추가/수정, 0개 삭제
⏰ 다음 동기화: 10초 후
```

## 테스트 방법

### 1. 정방향 테스트 (MySQL → PostgreSQL)

```sql
-- MySQL Workbench에서 실행
INSERT INTO posts (user_id, title, content, created_at)
VALUES (5, '테스트 게시글', '정방향 동기화 테스트', NOW());
```

**확인**:

1. 5초 대기
2. Render 사이트 방문
3. 갤러리에서 "테스트 게시글" 확인

### 2. 역방향 테스트 (PostgreSQL → MySQL)

1. https://ai-moviereview.onrender.com 접속
2. 로그인
3. 새 게시글 작성: "역방향 테스트"
4. 10초 대기
5. MySQL Workbench에서 확인:
   ```sql
   SELECT * FROM posts ORDER BY id DESC LIMIT 5;
   ```

## 문제 해결

### 동기화가 안 될 때

1. **프로세스 확인**:

   ```bash
   pm2 status
   ```

2. **로그 확인**:

   ```bash
   pm2 logs
   ```

3. **재시작**:
   ```bash
   pm2 restart all
   ```

### 중복 데이터 발생

**원인**: 두 스크립트가 동시에 같은 데이터를 동기화

**해결**:

- 정상적인 현상입니다. `ON DUPLICATE KEY UPDATE` (MySQL), `ON CONFLICT DO UPDATE` (PostgreSQL)로 자동 처리됨

### 동기화 지연

**원인**: 네트워크 속도 또는 동기화 주기 설정

**해결**:

```properties
# .env에서 주기 단축
SYNC_INTERVAL=3000
REVERSE_SYNC_INTERVAL=5000
```

## 성능 최적화

### 권장 설정

| 상황                  | 정방향 주기 | 역방향 주기 |
| --------------------- | ----------- | ----------- |
| 개발 중 (빠른 테스트) | 3초         | 5초         |
| 일반 사용             | 5초         | 10초        |
| 저사양 PC             | 10초        | 15초        |
| 배터리 절약           | 15초        | 20초        |

### 네트워크 사용량

- **정방향**: 약 1-2 KB/동기화
- **역방향**: 약 2-3 KB/동기화 (Render 서버 거리 때문)
- **1시간 총 사용량**: 약 2-5 MB (변경사항 없을 경우)

## 자동 시작 설정

### Windows (작업 스케줄러)

1. **작업 스케줄러** 열기
2. **기본 작업 만들기**
3. **트리거**: 시스템 시작 시
4. **작업**: 다음 스크립트 실행
   ```bash
   pm2 resurrect
   ```
5. 초기 설정:
   ```bash
   pm2 start realtime_sync.js --name mysql-to-pg
   pm2 start sync_postgres_to_mysql.js --name pg-to-mysql
   pm2 save
   pm2 startup
   ```

## 주의사항

### 🚨 중요

1. **양방향 동기화 시작 전**: 양쪽 DB가 동일한 상태인지 확인
2. **네트워크 필수**: 인터넷 연결 필수 (Render 접속)
3. **MySQL 서비스**: 로컬 MySQL이 항상 실행 중이어야 함
4. **충돌 방지**: 같은 데이터를 양쪽에서 동시 수정하지 말 것

### 권장 워크플로우

**개발 환경**:

- 로컬에서 개발 → MySQL에 저장
- 정방향 동기화로 PostgreSQL에 자동 반영
- Git push → Render 자동 배포

**사용자 환경**:

- 사용자가 Render 사이트 사용
- PostgreSQL에 데이터 저장
- 역방향 동기화로 MySQL에 자동 백업

## 추가 기능

### 초기 동기화 (최초 1회)

양방향 동기화 시작 전 데이터 정합성을 위해:

```bash
# PostgreSQL → MySQL (Render 데이터를 로컬로)
node migrate_to_postgres.js

# 또는 반대로
node sync_postgres_to_mysql.js
```

### 수동 동기화

자동 동기화 없이 1회만 실행:

```bash
# MySQL → PostgreSQL
node migrate_to_postgres.js

# PostgreSQL → MySQL
node sync_postgres_to_mysql.js
```

## 참고

- **프로덕션**: Render PostgreSQL만 사용
- **개발**: MySQL + 양방향 동기화
- **백업**: 정기적으로 양쪽 DB 모두 덤프 권장
