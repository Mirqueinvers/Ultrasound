@echo off
setlocal
chcp 65001 >nul
title Ultrasound - миграция данных Registry (SQLite -> PostgreSQL)

echo ============================================================
echo   Ultrasound - перенос данных Registry в PostgreSQL
echo   Файл данных: c:\ultrasound\registry.db
echo ============================================================
echo.

rem ===== Проверка прав администратора =====
net session >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Запустите скрипт от имени администратора.
  echo          ПКМ по файлу -^> "Запуск от имени администратора".
  pause
  exit /b 1
)

rem ===== Корень проекта Server =====
cd /d "%~dp0.."
set "SERVER_ROOT=%CD%"
if not exist "%SERVER_ROOT%\package.json" (
  echo [ОШИБКА] Не найден package.json. Скрипт должен лежать в Server\deploy\.
  pause
  exit /b 1
)

rem ===== Файл с данными =====
set "DB_SRC=c:\ultrasound\registry.db"
if not exist "%DB_SRC%" (
  echo [ОШИБКА] Не найден файл %DB_SRC%
  echo          Положите registry.db в папку c:\ultrasound и запустите снова.
  pause
  exit /b 1
)
echo [OK] Найден файл данных: %DB_SRC%

rem ===== Резервная копия =====
set "TS=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "BACKUP=c:\ultrasound\registry.db.backup_%TS%"
copy /y "%DB_SRC%" "%BACKUP%" >nul
if errorlevel 1 (
  echo [ПРЕДУПРЕЖДЕНИЕ] Не удалось создать резервную копию.
) else (
  echo [OK] Резервная копия: %BACKUP%
)

rem ===== Зависимости (при необходимости) =====
if not exist "%SERVER_ROOT%\node_modules" (
  echo.
  echo Устанавливаю зависимости (npm ci), может занять несколько минут...
  cd /d "%SERVER_ROOT%"
  call npm ci
  if errorlevel 1 (
    echo [ОШИБКА] npm ci не удался.
    pause
    exit /b 1
  )
)

rem ===== Миграция =====
echo.
echo Запускаю миграцию registry.db (повторный запуск безопасен)...
cd /d "%SERVER_ROOT%"
call npx tsx prisma/migrate-registry-db.ts --from "%DB_SRC%"
if errorlevel 1 (
  echo.
  echo [ОШИБКА] Миграция не удалась. Смотрите вывод выше.
  pause
  exit /b 1
)

echo.
echo [OK] Миграция завершена. Проверьте сводку выше.
echo.
pause
