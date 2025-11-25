# 프로필 이미지 & 피드백 기능 구현 가이드

## 📊 현재 상태

### ✅ 정상 작동 중

- PostgreSQL 스키마 (users.profile_image, feedbacks 테이블)
- Supabase Edge Functions (feedbacks API)

### ❌ 미구현 항목

#### 1. 프로필 이미지 업로드

- [ ] Supabase Storage 버킷 생성
- [ ] 회원가입 시 이미지 업로드
- [ ] 프로필 이미지 표시
- [ ] register Edge Function 수정

#### 2. 사용자 피드백

- [ ] 피드백 작성 UI (모달)
- [ ] 피드백 목록 페이지
- [ ] JavaScript 함수 연동

---

## 🔧 Supabase Storage 설정

### 1단계: Storage 버킷 생성

```
1. Supabase 대시보드: https://supabase.com/dashboard/project/iwdivytuvwlpvzfnbigs
2. 왼쪽 메뉴 "Storage" 클릭
3. "Create a new bucket" 클릭
4. Bucket 설정:
   - Name: profile-images
   - Public bucket: ✅ 체크 (공개 접근 허용)
5. Create bucket 클릭
```

### 2단계: Storage 정책 설정

Supabase 대시보드 > Storage > profile-images > Policies:

```sql
-- 모든 사용자가 업로드 가능
CREATE POLICY "Anyone can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- 본인만 삭제 가능
CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images' AND auth.uid()::text = owner);
```

---

## 📝 로컬 PostgreSQL 연결 확인

### pgAdmin에서 확인할 항목

1. **users 테이블:**

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users';
```

예상 결과:

- id (integer)
- username (varchar 50)
- password (varchar 255)
- profile_image (varchar 255) ← 이게 있어야 함
- created_at (timestamp)

2. **feedbacks 테이블:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'feedbacks';
```

예상 결과:

- id (integer)
- user_id (integer)
- content (text)
- created_at (timestamp)

3. **데이터 확인:**

```sql
-- 사용자 수
SELECT COUNT(*) FROM users;

-- 피드백 수
SELECT COUNT(*) FROM feedbacks;
```

---

## 🐛 로컬 DB 문제 해결

### users 테이블에 profile_image 컬럼이 없는 경우:

```sql
ALTER TABLE users
ADD COLUMN profile_image VARCHAR(255);
```

### feedbacks 테이블이 없는 경우:

```sql
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedbacks_user ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_created ON feedbacks(created_at DESC);
```

---

## ✅ 다음 단계

1. **로컬 PostgreSQL 스키마 확인** (pgAdmin에서)
2. **Supabase Storage 버킷 생성**
3. **프론트엔드 코드 수정** (제가 작성 중)
4. **테스트**

로컬 DB 상태를 확인해주시면, 바로 코드 수정을 시작하겠습니다!
