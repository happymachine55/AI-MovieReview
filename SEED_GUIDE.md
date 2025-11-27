# Supabase 프로덕션 데이터 시딩 가이드

## 방법 1: Supabase SQL Editor 사용 (권장)

1. **Supabase Dashboard 접속**

   - https://supabase.com/dashboard/project/iwdivytuvwlpvzfnbigs

2. **SQL Editor 열기**

   - 좌측 메뉴에서 "SQL Editor" 클릭
   - 또는 직접: https://supabase.com/dashboard/project/iwdivytuvwlpvzfnbigs/sql/new

3. **SQL 파일 복사**

   - `seed_production_data.sql` 파일 내용을 전체 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

4. **결과 확인**
   - 마지막 SELECT 문에서 각 테이블의 레코드 수 확인
   - users_count, posts_count, reviews_count, comments_count, feedbacks_count

---

## 방법 2: psql 사용 (로컬 CLI)

### 사전 준비

1. **DB 비밀번호 확인**

   - Supabase Dashboard → Settings → Database
   - "Connection string" 섹션에서 비밀번호 확인 또는 재설정

2. **psql 설치 확인**
   ```
   psql --version
   ```

### 실행 명령어

```cmd
cd "c:\Users\user\Documents\캡스톤디자인과제\movie_exercise2.13\supabase-MovieReview"

psql "postgresql://postgres.iwdivytuvwlpvzfnbigs:[YOUR-DB-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres" -f seed_production_data.sql
```

**[YOUR-DB-PASSWORD]** 부분을 실제 비밀번호로 교체하세요.

---

## 방법 3: Supabase CLI 사용

```cmd
cd "c:\Users\user\Documents\캡스톤디자인과제\movie_exercise2.13\supabase-MovieReview"

supabase db push --db-url "postgresql://postgres.iwdivytuvwlpvzfnbigs:[YOUR-DB-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres" --file seed_production_data.sql
```

---

## 실행 후 확인 사항

### 1. 로그인 테스트

- 사이트 접속: https://ai-movie-review-delta.vercel.app
- 로그인 정보:
  - 아이디: `user1`, 비밀번호: `1111`
  - 아이디: `user2`, 비밀번호: `1111`
  - 아이디: `user3`, 비밀번호: `1111`

### 2. 데이터 확인

- ✅ 메인 페이지: 게시글 5개 표시
- ✅ 갤러리: 게시글 목록 표시
- ✅ 영화 상세: 리뷰 6개 표시
- ✅ 게시글 상세: 댓글 표시
- ✅ 피드백: 피드백 4개 표시

### 3. RLS 정책 확인

데이터가 여전히 안 보이면:

- Supabase Dashboard → Authentication → Policies
- 각 테이블(posts, reviews, comments, feedbacks)에 대해:
  - "Enable RLS" 활성화
  - SELECT 정책 추가: `true` (모든 사용자 읽기 허용)

---

## 문제 해결

### PowerShell 실행 정책 오류

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### psql 미설치

- PostgreSQL 설치: https://www.postgresql.org/download/windows/
- 또는 Supabase SQL Editor 사용 (가장 간단)

### 중복 데이터 방지

- 스크립트는 이미 `where not exists` 조건으로 중복 방지 처리되어 있음
- 여러 번 실행해도 안전함

---

## 추천 방법

**Supabase SQL Editor 사용**이 가장 빠르고 안전합니다:

1. 브라우저에서 Supabase Dashboard 열기
2. SQL Editor에 `seed_production_data.sql` 복사/붙여넣기
3. Run 클릭
4. 완료!
