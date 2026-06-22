@echo off
title Instatag
cd /d "%~dp0"

echo ============================================
echo            Instatag - launcher
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js / npm was not found on your PATH.
  echo Install Node.js from https://nodejs.org and run this again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies, this can take a minute...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting the dev server on http://localhost:3000 ...
echo (Close this window or press Ctrl+C to stop the app.)
echo.

rem Open the browser shortly after the server boots.
start "" cmd /c "timeout /t 6 /nobreak >nul & start """" http://localhost:3000"

call npm run dev
