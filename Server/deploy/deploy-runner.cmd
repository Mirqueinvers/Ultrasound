@echo off
setlocal
chcp 65001 >nul
rem ============================================================
rem  Ultrasound API - автоматическое обновление (веб-деплой)
rem  Запускается планировщиком (schtasks) от имени SYSTEM.
rem  Путь к zip-пакету берётся из deploy\incoming\latest.txt
rem  Весь вывод идёт в logs\deploy.log
rem ============================================================

set "ROOT=%~dp0.."
set "INCOMING=%ROOT%\deploy\incoming"
set "LATEST=%INCOMING%\latest.txt"
set "NSSM_EXE=%~dp0nssm.exe"

if not exist "%ROOT%\logs" mkdir "%ROOT%\logs"
set "LOG=%ROOT%\logs\deploy.log"

> "%LOG%" call :main %*
set "RC=%errorlevel%"
exit /b %RC%

:main
echo [%date% %time%] ============================================================
echo [%date% %time%]  Ultrasound API: развёртывание обновления
echo [%date% %time%] ============================================================

if not exist "%LATEST%" (
  echo [ОШИБКА] Не найден %LATEST% с путём к пакету.
  exit /b 1
)
set /p ZIP= < "%LATEST%"
if not exist "%ZIP%" (
  echo [ОШИБКА] Не найден пакет обновления: %ZIP%
  exit /b 1
)
if not exist "%ROOT%\package.json" (
  echo [ОШИБКА] Не найден package.json в %ROOT%
  exit /b 1
)
if not exist "%NSSM_EXE%" (
  echo [ОШИБКА] Не найден %NSSM_EXE%. Выполните install-server.bat.
  exit /b 1
)

rem ----- Node.js в PATH (для службы SYSTEM) -----
for /f "delims=" %%p in ('where node 2^>nul') do set "NODE_DIR=%%~dpp"
if defined NODE_DIR (
  set "PATH=%NODE_DIR%;%PATH%"
  echo [OK] Node.js: %NODE_DIR%
) else (
  echo [ОШИБКА] node не найден в PATH.
  exit /b 1
)

echo [INFO] Корень сервера: %ROOT%
echo [INFO] Пакет: %ZIP%

rem ----- 1. Задержка, чтобы API успел ответить клиенту -----
echo [1/10] Пауза 3 сек...
timeout /t 3 /nobreak >nul

rem ----- 2. Остановка службы (снимает блокировки файлов) -----
echo [2/10] Останавливаю службу UltrasoundAPI...
"%NSSM_EXE%" stop UltrasoundAPI
if errorlevel 1 (
  echo [ОШИБКА] Не удалось остановить службу UltrasoundAPI.
  exit /b 1
)

rem ----- 3. Резервная копия текущей версии -----
set "TS=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TS=%TS: =0%"
set "BK=%ROOT%\backups\backup_%TS%"
mkdir "%BK%" 2>nul
echo [3/10] Резервная копия: %BK%
if exist "%ROOT%\src" (
  robocopy "%ROOT%\src" "%BK%\src" /E /NFL /NDL /NJH /NJS /NP >nul
  if errorlevel 8 goto :backup_error
)
if exist "%ROOT%\prisma" (
  robocopy "%ROOT%\prisma" "%BK%\prisma" /E /NFL /NDL /NJH /NJS /NP >nul
  if errorlevel 8 goto :backup_error
)
if exist "%ROOT%\dist" (
  robocopy "%ROOT%\dist" "%BK%\dist" /E /NFL /NDL /NJH /NJS /NP >nul
  if errorlevel 8 goto :backup_error
)
copy /y "%ROOT%\package.json" "%BK%\package.json" >nul
copy /y "%ROOT%\package-lock.json" "%BK%\package-lock.json" >nul
if exist "%ROOT%\tsconfig.json" copy /y "%ROOT%\tsconfig.json" "%BK%\tsconfig.json" >nul
echo [OK] Резервная копия создана.

rem ----- 4. Распаковка пакета -----
echo [4/10] Распаковываю пакет...
set "STG=%ROOT%\deploy\staging"
rmdir /s /q "%STG%" 2>nul
mkdir "%STG%" 2>nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%STG%' -Force"
if errorlevel 1 (
  echo [ОШИБКА] Не удалось распаковать пакет.
  exit /b 1
)
if not exist "%STG%\package.json" (
  echo [ОШИБКА] В пакете нет package.json.
  exit /b 1
)
if not exist "%STG%\src" (
  echo [ОШИБКА] В пакете нет папки src.
  exit /b 1
)

rem ----- 5. Замена файлов -----
echo [5/10] Копирую файлы обновления...
rmdir /s /q "%ROOT%\src"
xcopy /y /e /i /q "%STG%\src" "%ROOT%\src" >nul
if errorlevel 1 exit /b 1
if exist "%STG%\prisma" (
  rmdir /s /q "%ROOT%\prisma"
  xcopy /y /e /i /q "%STG%\prisma" "%ROOT%\prisma" >nul
  if errorlevel 1 exit /b 1
)
copy /y "%STG%\package.json" "%ROOT%\package.json" >nul
copy /y "%STG%\package-lock.json" "%ROOT%\package-lock.json" >nul
if exist "%STG%\tsconfig.json" copy /y "%STG%\tsconfig.json" "%ROOT%\tsconfig.json" >nul

rem ----- 6. npm ci -----
echo [6/10] Устанавливаю зависимости (npm ci)...
cd /d "%ROOT%"
call npm ci
if errorlevel 1 (
  echo [ОШИБКА] npm ci не удался.
  goto :fail
)

rem ----- 7. Миграции -----
echo [7/10] Применяю миграции Prisma...
call npx prisma migrate deploy
if errorlevel 1 (
  echo [ОШИБКА] Миграции не применились. Проверьте .env и что PostgreSQL запущен.
  goto :fail
)

rem ----- 8. Генерация Prisma Client -----
echo [8/10] Генерирую Prisma Client...
call npx prisma generate
if errorlevel 1 (
  echo [ОШИБКА] prisma generate не удался.
  goto :fail
)

rem ----- 9. Сборка -----
echo [9/10] Собираю TypeScript...
call npm run build
if errorlevel 1 (
  echo [ОШИБКА] Сборка не удалась.
  goto :fail
)

rem ----- 10. Запуск службы -----
echo [10/10] Запускаю службу UltrasoundAPI...
"%NSSM_EXE%" start UltrasoundAPI
if errorlevel 1 (
  echo [ОШИБКА] Не удалось запустить службу.
  goto :fail
)

echo.
echo [OK] Обновление успешно завершено.
call :set_state ok "Обновление успешно завершено"
exit /b 0

:backup_error
echo [ОШИБКА] Не удалось создать резервную копию.
exit /b 1

:fail
echo.
echo [ОШИБКА] Развёртывание прервано. Восстанавливаю предыдущую версию...
if exist "%BK%" (
  if exist "%BK%\src" (
    rmdir /s /q "%ROOT%\src"
    xcopy /y /e /i /q "%BK%\src" "%ROOT%\src" >nul
  )
  if exist "%BK%\prisma" (
    rmdir /s /q "%ROOT%\prisma"
    xcopy /y /e /i /q "%BK%\prisma" "%ROOT%\prisma" >nul
  )
  if exist "%BK%\dist" (
    rmdir /s /q "%ROOT%\dist"
    xcopy /y /e /i /q "%BK%\dist" "%ROOT%\dist" >nul
  )
  copy /y "%BK%\package.json" "%ROOT%\package.json" >nul
  copy /y "%BK%\package-lock.json" "%ROOT%\package-lock.json" >nul
  if exist "%BK%\tsconfig.json" copy /y "%BK%\tsconfig.json" "%ROOT%\tsconfig.json" >nul
  echo [OK] Код восстановлен.
  echo Переустанавливаю зависимости предыдущей версии...
  cd /d "%ROOT%"
  call npm ci
  if errorlevel 1 echo [ВНИМАНИЕ] npm ci при восстановлении не удался.
) else (
  echo [ВНИМАНИЕ] Резервная копия не найдена — откат невозможен.
)

echo Запускаю службу UltrasoundAPI...
"%NSSM_EXE%" start UltrasoundAPI >nul 2>&1

echo.
echo [ОШИБКА] Развёртывание завершилось с ошибкой (см. лог выше).
call :set_state failed "Развёртывание завершилось с ошибкой (см. лог)"
exit /b 1

:set_state
rem Обновляет deploy\state.json: аргумент 1 - статус, аргумент 2 - сообщение
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%ROOT%\deploy\state.json'; try { $s = Get-Content -LiteralPath $p -Raw -ErrorAction Stop | ConvertFrom-Json } catch { $s = [PSCustomObject]@{} }; $s | Add-Member -NotePropertyName status -NotePropertyValue '%~1' -Force; $s | Add-Member -NotePropertyName finishedAt -NotePropertyValue (Get-Date).ToString('o') -Force; $s | Add-Member -NotePropertyName message -NotePropertyValue '%~2' -Force; $s | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $p -Encoding UTF8"
exit /b 0

