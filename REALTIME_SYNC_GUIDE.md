# 🔄 MySQL → PostgreSQL 실시간 동기화 가이드

## 개요

MySQL Workbench에서 데이터를 추가/수정/삭제하면 자동으로 Render PostgreSQL에 반영되는 실시간 동기화 시스템입니다.

## 동작 방식

1. **자동 감지**: 5초마다 MySQL의 변경사항을 감지
2. **증분 동기화**: 새로운/변경된 데이터만 PostgreSQL에 전송
3. **삭제 동기화**: MySQL에서 삭제된 레코드를 PostgreSQL에서도 삭제
4. **스키마 체크**: 10분마다 새로운 테이블 생성 감지

## 사용 방법

### 1. 동기화 스크립트 실행

```bash
# 터미널에서 실행
node realtime_sync.js
```

### 2. 실행 결과

```
╔════════════════════════════════════════════════════════════╗
║     MySQL → PostgreSQL 실시간 동기화 시작                 ║
╚════════════════════════════════════════════════════════════╝

⏱️  동기화 주기: 5초
🔗 PostgreSQL: dpg-d3sti2pr0fns738p1ee0-a.singapore-postgres.render.com/gallery_movie_l9rv
🔗 MySQL: localhost/gallery_movie

💡 종료하려면 Ctrl+C를 누르세요

🔄 동기화 시작...
✅ 변경사항 없음 (오후 8:30:15)
```

### 3. MySQL Workbench에서 데이터 변경

#### 예시 1: 새 사용자 추가

```sql
INSERT INTO users (username, password, created_at)
VALUES ('newuser', 'hashed_password', NOW());
```

**동기화 결과:**

```
🔄 동기화 시작...
📊 users: 1개의 새로운 레코드 발견
✅ 동기화 완료: 1개 추가/수정, 0개 삭제
⏰ 다음 동기화: 5초 후
```

#### 예시 2: 리뷰 삭제

```sql
DELETE FROM reviews WHERE id = 78;
```

**동기화 결과:**

```
🔄 동기화 시작...
🗑️  reviews: 1개의 삭제된 레코드 감지
✅ 동기화 완료: 0개 추가/수정, 1개 삭제
```

#### 예시 3: 게시글 수정

```sql
UPDATE posts SET title = '수정된 제목' WHERE id = 30;
```

**참고:** 현재 버전은 새로운 데이터 추가와 삭제만 감지합니다. 기존 데이터 수정은 감지되지 않습니다.

## 환경 설정

### .env 파일 설정

```properties
# MySQL (로컬)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1111
DB_NAME=gallery_movie

# PostgreSQL (Render)
POSTGRES_URL=postgresql://gallery_movie_l9rv_user:비밀번호@호스트/데이터베이스

# 동기화 주기 (선택사항, 기본: 5000ms = 5초)
SYNC_INTERVAL=5000
```

### 동기화 주기 변경

더 빠른 동기화가 필요하면:

```properties
SYNC_INTERVAL=2000  # 2초마다 동기화
```

덜 빈번한 동기화가 필요하면:

```properties
SYNC_INTERVAL=10000  # 10초마다 동기화
```

## 지원 기능

### ✅ 지원되는 작업

| 작업           | MySQL | PostgreSQL          | 감지 시간     |
| -------------- | ----- | ------------------- | ------------- |
| INSERT (추가)  | ✅    | ✅ 자동 반영        | 5초 이내      |
| DELETE (삭제)  | ✅    | ✅ 자동 반영        | 5초 이내      |
| 새 테이블 생성 | ✅    | ⚠️ 수동 동기화 필요 | 10분마다 알림 |

### ⚠️ 제한사항

| 작업          | 상태           | 해결 방법                         |
| ------------- | -------------- | --------------------------------- |
| UPDATE (수정) | ❌ 미지원      | 수동으로 PostgreSQL 업데이트 필요 |
| 스키마 변경   | ❌ 자동 미지원 | `create_tables.js` 수동 실행      |

## 백그라운드 실행

### Windows (pm2 사용)

```bash
# pm2 설치
npm install -g pm2

# 백그라운드 실행
pm2 start realtime_sync.js --name mysql-sync

# 상태 확인
pm2 status

# 로그 확인
pm2 logs mysql-sync

# 중지
pm2 stop mysql-sync

# 재시작
pm2 restart mysql-sync
```

### Windows (작업 스케줄러 사용)

1. **작업 스케줄러** 열기
2. **기본 작업 만들기** 클릭
3. **트리거**: 시스템 시작 시
4. **작업**: `node C:\경로\realtime_sync.js`
5. **조건**: "컴퓨터의 AC 전원 사용 시에만 시작" 해제

## 문제 해결

### 1. 연결 오류

```
❌ 오류: connect ECONNREFUSED
```

**해결:**

- MySQL 서비스가 실행 중인지 확인
- `.env` 파일의 `DB_HOST`, `DB_USER`, `DB_PASSWORD` 확인

### 2. PostgreSQL 인증 실패

```
❌ password authentication failed
```

**해결:**

- Render 대시보드에서 최신 `Internal Database URL` 복사
- `.env` 파일의 `POSTGRES_URL` 업데이트

### 3. 동기화가 느림

**해결:**

- `.env`에서 `SYNC_INTERVAL` 값을 줄이기 (예: 2000)
- 네트워크 연결 상태 확인

### 4. 스키마 변경 감지

```
⚠️  새로운 테이블 감지: new_table
💡 create_tables.js를 실행하여 스키마를 동기화하세요!
```

**해결:**

```bash
# 테이블 구조를 create_tables.js에 추가 후 실행
node create_tables.js
```

## 주의사항

### 🚨 중요

1. **양방향 동기화 아님**: MySQL → PostgreSQL 단방향만 지원
2. **Render에서 직접 수정 금지**: PostgreSQL을 직접 수정하면 다음 동기화 시 덮어써질 수 있음
3. **대량 데이터**: 처음 실행 시 많은 데이터가 있으면 시간이 걸릴 수 있음
4. **네트워크 필수**: 인터넷 연결이 끊기면 동기화 중지

## 모니터링

### 로그 확인

스크립트 실행 시 실시간 로그가 출력됩니다:

```
✅ 동기화 완료: 5개 추가/수정, 2개 삭제
⏰ 다음 동기화: 5초 후

📊 users: 2개의 새로운 레코드 발견
📊 posts: 3개의 새로운 레코드 발견
🗑️  comments: 2개의 삭제된 레코드 감지
```

### 통계 정보

- **추가/수정**: MySQL에 새로 추가되거나 PostgreSQL에 없는 레코드
- **삭제**: MySQL에서 삭제되어 PostgreSQL에서도 제거된 레코드

## 대안 방법

실시간 동기화가 필요 없다면:

### 1회성 마이그레이션

```bash
node migrate_to_postgres.js
```

### 수동 동기화

```bash
node sync_mysql_to_postgres.js
```

## 성능 최적화

### 권장 설정

| 환경      | SYNC_INTERVAL | 설명          |
| --------- | ------------- | ------------- |
| 개발 중   | 2000-3000ms   | 빠른 피드백   |
| 일반 사용 | 5000ms (기본) | 균형잡힌 성능 |
| 저사양 PC | 10000-15000ms | 부하 감소     |

### 네트워크 사용량

- **기본 설정 (5초)**: 약 1-2 KB/동기화
- **1시간 사용량**: ~1-2 MB (변경사항 없을 경우)
- **대량 데이터**: 초기 동기화 시 데이터량에 비례

## 참고

- **개발 환경**: 로컬 MySQL → Render PostgreSQL
- **프로덕션**: Render Web Service는 PostgreSQL만 사용
- **백업**: 정기적으로 MySQL과 PostgreSQL 모두 백업 권장
