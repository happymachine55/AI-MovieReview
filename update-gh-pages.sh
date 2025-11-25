#!/bin/bash
# GitHub Pages를 supabase-movie 브랜치의 frontend 폴더로 업데이트하는 스크립트

echo "📦 gh-pages 브랜치를 supabase-movie/frontend로 업데이트합니다..."

# 1. 현재 브랜치 저장
CURRENT_BRANCH=$(git branch --show-current)
echo "현재 브랜치: $CURRENT_BRANCH"

# 2. gh-pages 브랜치로 전환 (없으면 생성)
git checkout gh-pages 2>/dev/null || git checkout -b gh-pages

# 3. gh-pages의 모든 내용 삭제 (git 파일 제외)
git rm -rf . 2>/dev/null || true
rm -rf * 2>/dev/null || true

# 4. supabase-movie 브랜치의 frontend 폴더 내용 가져오기
git checkout supabase-movie -- frontend/

# 5. frontend 폴더 내용을 루트로 이동
mv frontend/* . 2>/dev/null || true
mv frontend/.[!.]* . 2>/dev/null || true
rmdir frontend 2>/dev/null || true

# 6. 404.html 추가 확인
if [ ! -f "404.html" ]; then
    cat > 404.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>리다이렉팅...</title>
    <script>
        const query = window.location.search;
        window.location.replace('/' + (query || ''));
    </script>
</head>
<body>페이지를 불러오는 중...</body>
</html>
EOF
fi

# 7. 커밋 및 푸시
git add .
git commit -m "Update gh-pages from supabase-movie/frontend"
git push origin gh-pages -f

# 8. 원래 브랜치로 돌아가기
git checkout $CURRENT_BRANCH

echo "✅ gh-pages 업데이트 완료!"
echo "🌐 GitHub Pages: https://happymachine55.github.io/AI-MovieReview/"
