@echo off
echo ================================
echo React 프론트엔드 설정 시작
echo ================================
echo.

cd /d D:\projects\FianlProject_webApplication\frontend

echo [1/2] React Router 설치 중...
call npm install react-router-dom

echo.
echo [2/2] Tailwind CSS 설치 중...
call npm install -D tailwindcss postcss autoprefixer

echo.
echo ================================
echo 설치 완료!
echo ================================
echo.
echo 이제 다음 명령어로 서버를 실행하세요:
echo npm start
echo.
pause
