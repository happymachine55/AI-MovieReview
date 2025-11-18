# Supabase 설정 가이드

## 1단계: 데이터베이스 스키마 생성

### 방법 1: Supabase SQL Editor 사용 (추천)

1. Supabase 대시보드 열기: https://supabase.com/dashboard/project/iwdivytuvwlpvzfnbigs
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. 새 쿼리 생성 (New query 버튼)
4. `supabase/migrations/20250118000000_init_schema.sql` 파일 내용 전체 복사
5. SQL Editor에 붙여넣기
6. **RUN** 버튼 클릭하여 실행
7. ✅ 성공 메시지 확인

### 방법 2: CLI 사용 (옵션)

```bash
# Supabase 로그인 (브라우저에서 인증)
npx supabase login

# 프로젝트 연결
npx supabase link --project-ref iwdivytuvwlpvzfnbigs

# 마이그레이션 적용
npx supabase db push
```

---

## 2단계: Render DB에서 데이터 마이그레이션

### 전제 조건

- `.env` 파일에 `RENDER_DB_URL`, `SUPABASE_DB_URL` 설정 완료
- `pg` 패키지 설치: `npm install pg dotenv`

### 실행

```bash
node migrate_render_to_supabase.js
```

### 예상 출력

```
🚀 Render → Supabase 데이터 마이그레이션 시작

📡 Render DB 연결 중...
✅ Render DB 연결 성공

📡 Supabase DB 연결 중...
✅ Supabase DB 연결 성공

[users] 데이터 복사 시작
  └─ 3개 row 발견
[users] ✅ 3개 복사 완료, 0개 스킵(중복)

[posts] 데이터 복사 시작
  └─ 10개 row 발견
[posts] ✅ 10개 복사 완료, 0개 스킵(중복)

...

🎉 모든 데이터 복사 완료!
```

---

## 3단계: Edge Functions 환경 변수 설정

1. Supabase 대시보드 > **Settings** > **Edge Functions**
2. **Add new secret** 클릭
3. 환경 변수 추가:
   - `GEMINI_API_KEY` = `AIzaSyCO-jsOp7AOYLcVoOZ3nH2IMo2oIf2NCtQ`

---

## 4단계: 데이터 확인

### SQL Editor에서 확인

```sql
-- 사용자 확인
SELECT * FROM users;

-- 게시글 확인
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;

-- 리뷰 확인
SELECT * FROM reviews ORDER BY created_at DESC LIMIT 10;

-- 댓글 확인
SELECT * FROM comments ORDER BY created_at DESC LIMIT 10;
```

### 테이블 구조 확인

```sql
\d users
\d posts
\d reviews
\d comments
\d feedbacks
```

---

## 5단계: Edge Functions 배포 (선택)

```bash
# 모든 함수 배포
npx supabase functions deploy

# 특정 함수만 배포
npx supabase functions deploy login
npx supabase functions deploy register
npx supabase functions deploy posts
npx supabase functions deploy reviews
npx supabase functions deploy comments
npx supabase functions deploy feedbacks
npx supabase functions deploy ai-review
npx supabase functions deploy likes
```

---

## 문제 해결

### DB 비밀번호 특수문자 문제

비밀번호에 `@`, `!`, `?` 등이 있으면 URL 인코딩 필요:

```
원본: QHjs@Fy!H-7iW?R
인코딩: QHjs%40Fy%21H-7iW%3FR
```

**.env에서 사용:**

```env
SUPABASE_DB_URL=postgresql://postgres:QHjs%40Fy%21H-7iW%3FR@db.iwdivytuvwlpvzfnbigs.supabase.co:5432/postgres
```

### CLI 로그인 실패

- **해결 1**: 웹 대시보드 SQL Editor 사용
- **해결 2**: Access Token 직접 설정
  ```bash
  set SUPABASE_ACCESS_TOKEN=your-access-token
  npx supabase link --project-ref iwdivytuvwlpvzfnbigs
  ```

---

## 프로젝트 정보

- **프로젝트 이름**: supabase-MovieReview
- **프로젝트 ID**: iwdivytuvwlpvzfnbigs
- **프로젝트 URL**: https://iwdivytuvwlpvzfnbigs.supabase.co
- **DB 호스트**: db.iwdivytuvwlpvzfnbigs.supabase.co
- **DB 포트**: 5432
- **DB 이름**: postgres
- **DB 사용자**: postgres
- **DB 비밀번호**: QHjs@Fy!H-7iW?R
