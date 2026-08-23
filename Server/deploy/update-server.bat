@echo off
setlocal
chcp 65001 >nul
title Ultrasound API - обновление сервера

net session >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Запустите скрипт от имени администратора.
  pause
  exit /b 1
)

cd /d "%~dp0.."
set "SERVER_ROOT=%CD%"
echo Обновление сервера в %SERVER_ROOT%
if not exist "%SERVER_ROOT%\package.json" (
  echo [ОШИБКА] Не найден package.json.
  pause
  exit /b 1
)

echo.
echo [1/5] Обновляю зависимости (npm ci)...
cd /d "%SERVER_ROOT%"
call npm ci
if errorlevel 1 (
  echo [ОШИБКА] npm ci не удался.
  pause
  exit /b 1
)

echo [2/5] Применяю миграции Prisma...
call npx prisma migrate deploy
if errorlevel 1 (
  echo [ОШИБКА] Миграции не применились. Проверьте .env и что PostgreSQL запущен.
  pause
  exit /b 1
)

echo [3/5] Генерирую Prisma Client...
call npx prisma generate
if errorlevel 1 (
  echo [ОШИБКА] prisma generate не удался.
  pause
  exit /b 1
)

echo [4/5] Собираю TypeScript...
call npm run build
if errorlevel 1 (
  echo [ОШИБКА] Сборка не удалась.
  pause
  exit /b 1
)

echo [5/5] Перезапускаю службу UltrasoundAPI...
set "NSSM_EXE=%~dp0nssm.exe"
if not exist "%NSSM_EXE%" (
  echo [ОШИБКА] Не найден nssm.exe. Сначала выполните install-server.bat.
  pause
  exit /b 1
)
"%NSSM_EXE%" restart UltrasoundAPI
if errorlevel 1 (
  echo [ОШИБКА] Не удалось перезапустить службу.
  pause
  exit /b 1
)

echo.
echo [OK] Сервер обновлён. Проверка: http://localhost:4000/api/health
pause
