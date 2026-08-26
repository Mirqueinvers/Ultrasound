@echo off
setlocal
chcp 65001 >nul
title Ultrasound API - установка сервера (Windows, без Docker)

echo ============================================================
echo   Ultrasound API - установка сервера
echo   Windows + PostgreSQL 16 + Node.js 22 (без Docker)
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
echo Каталог сервера: %SERVER_ROOT%
if not exist "%SERVER_ROOT%\package.json" (
  echo [ОШИБКА] Не найден package.json. Скрипт должен лежать в Server\deploy\.
  pause
  exit /b 1
)

rem ===== Проверка Node.js =====
where node >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Node.js не установлен. Скачайте Node.js 22 LTS: https://nodejs.org
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node --version') do set "NODE_VER=%%v"
for /f "delims=" %%n in ('where node') do set "NODE_EXE=%%n"
echo [OK] Node.js: %NODE_VER%  (%NODE_EXE%)

rem ===== Поиск psql (PostgreSQL) =====
set "PSQL="
for /d %%d in ("C:\Program Files\PostgreSQL\*") do (
  if exist "%%d\bin\psql.exe" set "PSQL=%%d\bin\psql.exe"
)
if not defined PSQL (
  echo [ОШИБКА] PostgreSQL не найден в C:\Program Files\PostgreSQL.
  echo          Установите PostgreSQL 16: https://www.postgresql.org/download/windows/
  pause
  exit /b 1
)
echo [OK] psql: %PSQL%

rem ===== Параметры подключения =====
set "DB_USER=ultrasound"
set "DB_NAME=ultrasound"
set "DB_HOST=localhost"
set "DB_PORT=5432"
set "API_PORT=4000"

rem ===== Запрос паролей =====
echo.
echo Пароль для пользователя БД "%DB_USER%" (только латиница/цифры, без @ : / \ # ? ' "):
set /p "DB_PASSWORD=Пароль: "
if "%DB_PASSWORD%"=="" (
  echo [ОШИБКА] Пароль не может быть пустым.
  pause
  exit /b 1
)

echo.
echo Пароль суперпользователя postgres (задан при установке PostgreSQL; без спецсимволов ^& ^|):
set /p "PG_PASSWORD=Пароль postgres: "

rem ===== Генерация JWT_SECRET =====
for /f "usebackq delims=" %%s in (`powershell -NoProfile -Command "$s = [Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N'); Write-Output $s"`) do set "JWT_SECRET=%%s"

rem ===== Генерация DEPLOY_TOKEN (для веб-обновления по сети) =====
for /f "usebackq delims=" %%t in (`powershell -NoProfile -Command "$s = [Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N'); Write-Output $s"`) do set "DEPLOY_TOKEN=%%t"

rem ===== Запись .env =====
(
  echo DATABASE_URL="postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%"
  echo JWT_SECRET="%JWT_SECRET%"
  echo DEPLOY_TOKEN="%DEPLOY_TOKEN%"
  echo PORT=%API_PORT%
  echo POSTGRES_USER=%DB_USER%
  echo POSTGRES_PASSWORD=%DB_PASSWORD%
  echo POSTGRES_DB=%DB_NAME%
  echo POSTGRES_PORT=%DB_PORT%
  echo API_PORT=%API_PORT%
) > "%SERVER_ROOT%\.env"
echo [OK] Создан %SERVER_ROOT%\.env

rem ===== Создание пользователя и базы в PostgreSQL =====
set "PGPASSWORD=%PG_PASSWORD%"

"%PSQL%" -h %DB_HOST% -p %DB_PORT% -U postgres -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='%DB_USER%'" | findstr /r "^1" >nul
if errorlevel 1 (
  echo Создаю пользователя %DB_USER%...
  "%PSQL%" -h %DB_HOST% -p %DB_PORT% -U postgres -d postgres -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%' LOGIN;"
  if errorlevel 1 (
    echo [ОШИБКА] Не удалось создать пользователя. Проверьте пароль postgres.
    pause
    exit /b 1
  )
) else (
  echo [OK] Пользователь %DB_USER% существует, обновляю пароль.
  "%PSQL%" -h %DB_HOST% -p %DB_PORT% -U postgres -d postgres -c "ALTER USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';"
)

"%PSQL%" -h %DB_HOST% -p %DB_PORT% -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='%DB_NAME%'" | findstr /r "^1" >nul
if errorlevel 1 (
  echo Создаю базу данных %DB_NAME%...
  "%PSQL%" -h %DB_HOST% -p %DB_PORT% -U postgres -d postgres -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;"
  if errorlevel 1 (
    echo [ОШИБКА] Не удалось создать базу данных.
    pause
    exit /b 1
  )
) else (
  echo [OK] База данных %DB_NAME% уже существует.
)
set "PGPASSWORD="

rem ===== Установка зависимостей =====
echo.
echo Устанавливаю зависимости (npm ci), может занять несколько минут...
cd /d "%SERVER_ROOT%"
call npm ci
if errorlevel 1 (
  echo [ОШИБКА] npm ci не удался. Проверьте доступ в интернет.
  pause
  exit /b 1
)

rem ===== Миграции Prisma =====
echo.
echo Применяю миграции Prisma...
call npx prisma migrate deploy
if errorlevel 1 (
  echo [ОШИБКА] Миграции не применились. Проверьте, что PostgreSQL запущен и .env корректен.
  pause
  exit /b 1
)

rem ===== Генерация Prisma Client =====
echo.
echo Генерирую Prisma Client...
call npx prisma generate
if errorlevel 1 (
  echo [ОШИБКА] prisma generate не удался.
  pause
  exit /b 1
)

rem ===== Сборка =====
echo.
echo Собираю TypeScript...
call npm run build
if errorlevel 1 (
  echo [ОШИБКА] Сборка не удалась.
  pause
  exit /b 1
)

rem ===== NSSM: скачивание при необходимости =====
set "NSSM_EXE=%~dp0nssm.exe"
if not exist "%NSSM_EXE%" (
  echo.
  echo Скачиваю NSSM для запуска API как службы Windows...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '%~dp0nssm.zip' -UseBasicParsing; Expand-Archive -Path '%~dp0nssm.zip' -DestinationPath '%~dp0nssm_tmp' -Force"
  if errorlevel 1 (
    echo [ОШИБКА] Не удалось скачать NSSM. Скачайте вручную https://nssm.cc/download и положите nssm.exe в %~dp0
    pause
    exit /b 1
  )
  set "NSSM_BIN=%~dp0nssm_tmp\nssm-2.24\win64\nssm.exe"
  if "%PROCESSOR_ARCHITECTURE%"=="x86" set "NSSM_BIN=%~dp0nssm_tmp\nssm-2.24\win32\nssm.exe"
  copy /y "%NSSM_BIN%" "%NSSM_EXE%" >nul
  if errorlevel 1 (
    echo [ОШИБКА] Не удалось распаковать NSSM.
    pause
    exit /b 1
  )
  del "%~dp0nssm.zip" >nul 2>&1
  rmdir /s /q "%~dp0nssm_tmp" >nul 2>&1
)
echo [OK] NSSM: %NSSM_EXE%

rem ===== Удаление старой службы (если есть) =====
sc query UltrasoundAPI >nul 2>&1
if not errorlevel 1 (
  echo Останавливаю и удаляю предыдущую службу UltrasoundAPI...
  "%NSSM_EXE%" stop UltrasoundAPI >nul 2>&1
  "%NSSM_EXE%" remove UltrasoundAPI confirm >nul 2>&1
)

rem ===== Регистрация службы =====
echo.
echo Регистрирую службу UltrasoundAPI...
if not exist "%SERVER_ROOT%\logs" mkdir "%SERVER_ROOT%\logs"

"%NSSM_EXE%" install UltrasoundAPI "%NODE_EXE%" "%SERVER_ROOT%\dist\index.js"
"%NSSM_EXE%" set UltrasoundAPI AppDirectory "%SERVER_ROOT%"
"%NSSM_EXE%" set UltrasoundAPI AppStdout "%SERVER_ROOT%\logs\api.log"
"%NSSM_EXE%" set UltrasoundAPI AppStderr "%SERVER_ROOT%\logs\api-error.log"
"%NSSM_EXE%" set UltrasoundAPI AppRotateFiles 1
"%NSSM_EXE%" set UltrasoundAPI AppRotateBytes 10485760
"%NSSM_EXE%" set UltrasoundAPI AppExit Default Restart
"%NSSM_EXE%" set UltrasoundAPI AppRestartDelay 5000
"%NSSM_EXE%" set UltrasoundAPI Start SERVICE_AUTO_START
"%NSSM_EXE%" set UltrasoundAPI DisplayName "Ultrasound API Server"
"%NSSM_EXE%" set UltrasoundAPI Description "Central API server for Ultrasound Desktop and Registry"

echo Запускаю службу...
"%NSSM_EXE%" start UltrasoundAPI
if errorlevel 1 (
  echo [ОШИБКА] Не удалось запустить службу. Логи: %SERVER_ROOT%\logs\api-error.log
  pause
  exit /b 1
)

rem ===== Брандмауэр =====
echo.
echo Открываю порт %API_PORT% в брандмауэре Windows...
netsh advfirewall firewall delete rule name="Ultrasound API %API_PORT%" >nul 2>&1
netsh advfirewall firewall add rule name="Ultrasound API %API_PORT%" dir=in action=allow protocol=TCP localport=%API_PORT% >nul 2>&1

rem ===== Проверка =====
echo.
echo Проверяю работоспособность API...
timeout /t 3 /nobreak >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$r = try { (Invoke-RestMethod 'http://localhost:%API_PORT%/api/health' -TimeoutSec 15).status } catch { 'FAILED' }; if ($r -eq 'ok') { Write-Host '[OK] API работает' } else { Write-Host '[ОШИБКА] API не отвечает, смотрите logs\api-error.log'; exit 1 }"
if errorlevel 1 (
  pause
  exit /b 1
)

rem ===== Итог =====
echo.
echo ============================================================
echo   УСТАНОВКА ЗАВЕРШЕНА
echo ============================================================
echo   Health:     http://localhost:%API_PORT%/api/health
echo.
echo   IP-адреса этого компьютера (один из них указать в клиентах):
ipconfig | findstr /i "IPv4"
echo.
echo   Desktop:  экран "Адрес сервера" -^>  http://IP-ЭТОГО-ПК:%API_PORT%
echo   Registry: CENTRAL_API_URL        -^>  http://IP-ЭТОГО-ПК:%API_PORT%/api
echo ============================================================
echo.
pause
