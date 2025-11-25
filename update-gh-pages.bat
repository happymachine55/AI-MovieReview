@echo off
REM GitHub Pages를 supabase-movie 브랜치의 frontend 폴더로 업데이트하는 배치 파일

echo 📦 gh-pages 브랜치를 supabase-movie/frontend로 업데이트합니다...

REM 1. 현재 브랜치 저장
for /f %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 현재 브랜치: %CURRENT_BRANCH%

REM 2. gh-pages 브랜치로 전환 (없으면 생성)
git checkout gh-pages 2>nul || git checkout -b gh-pages

REM 3. gh-pages의 모든 내용 삭제 (git 파일 제외)
git rm -rf . 2>nul
for /d %%d in (*) do if /i not "%%d"==".git" rd /s /q "%%d" 2>nul
for %%f in (*) do del /q "%%f" 2>nul

REM 4. supabase-movie 브랜치의 frontend 폴더 내용 가져오기
git checkout supabase-movie -- frontend/

REM 5. frontend 폴더 내용을 루트로 이동
xcopy /E /I /Y frontend\* . >nul
rd /s /q frontend 2>nul

REM 6. 404.html 추가 확인
if not exist "404.html" (
    echo ^<!DOCTYPE html^> > 404.html
    echo ^<html^> >> 404.html
    echo ^<head^> >> 404.html
    echo     ^<meta charset="utf-8"^> >> 404.html
    echo     ^<title^>리다이렉팅...^</title^> >> 404.html
    echo     ^<script^> >> 404.html
    echo         const query = window.location.search; >> 404.html
    echo         window.location.replace('/' + (query ^|^| '')); >> 404.html
    echo     ^</script^> >> 404.html
    echo ^</head^> >> 404.html
    echo ^<body^>페이지를 불러오는 중...^</body^> >> 404.html
    echo ^</html^> >> 404.html
)

REM 7. 커밋 및 푸시
git add .
git commit -m "Update gh-pages from supabase-movie/frontend"
git push origin gh-pages -f

REM 8. 원래 브랜치로 돌아가기
git checkout %CURRENT_BRANCH%

echo.
echo ✅ gh-pages 업데이트 완료!
echo 🌐 GitHub Pages: https://happymachine55.github.io/AI-MovieReview/
pause
