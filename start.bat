@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title CLIP Premium - local server
color 0E

echo.
echo  ============================================
echo    CLIP PREMIUM  -  local test server
echo  ============================================
echo.

REM ---------- 1. Node.js check ----------
where node >nul 2>nul
if errorlevel 1 (
  echo  [X] Node.js is not installed.
  echo.
  echo      1. Open https://nodejs.org
  echo      2. Download the "LTS" version
  echo      3. Run the installer ^(Next ^> Next ^> Finish^)
  echo      4. Close this window and run start.bat again
  echo.
  start "" https://nodejs.org
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODEVER=%%v
echo  [OK] Node.js !NODEVER!

REM ---------- 2. .env check ----------
if not exist ".env" (
  copy /y ".env.example" ".env" >nul
  echo  [i] Created ".env" from the example file.
  echo.
  echo      Notepad is opening now - paste your key after TMDB_TOKEN=
  echo      Get a free key here: https://www.themoviedb.org/settings/api
  echo      ^(copy the long "API Read Access Token" that starts with eyJ...^)
  echo.
  echo      Save ^(Ctrl+S^), close Notepad, then run start.bat again.
  echo.
  start "" notepad ".env"
  pause
  exit /b 0
)

REM ---------- 3. Start server ----------
echo  [i] Starting the server...
echo      Browser: http://localhost:8080
echo      Stop with: Ctrl+C  or close this window
echo.
start "" http://localhost:8080
node server.js

echo.
echo  Server stopped.
pause
