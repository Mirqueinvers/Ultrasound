@echo off
setlocal
chcp 65001 >nul
rem ============================================================
rem  Ultrasound API - автоматическое обновление (веб-деплой)
rem  Запускается планировщиком (schtasks) от имени SYSTEM.
rem  Двухфазное обновление:
rem    Фаза 1 (безопасная): npm ci + сборка в deploy\staging,
rem      пока работающая служба продолжает обслуживать запросы.
rem    Фаза 2 (короткое окно): остановка службы, резервная копия,
rem      переключение файлов, миграции, запуск и проверка здоровья.
rem  При любой ошибке - автоматический откат и запуск службы.
rem  Весь вывод идёт в logs\deploy.log
rem ============================================================

set "ROOT=%~dp0.."
rem ---- режим тестирования (только для автотестов, не для прода) ----
if defined ULTRASOUND_TEST_ROOT set "ROOT=%ULTRASOUND_TEST_ROOT%"
set "INCOMING=%ROOT%\deploy\incoming"
set "LATEST=%INCOMING%\latest.txt"
set "NSSM_EXE=%~dp0nssm.exe"
if defined ULTRASOUND_TEST_NSSM set "NSSM_EXE=%ULTRASOUND_TEST_NSSM%"
set "TEST_FAST="
if defined ULTRASOUND_TEST_FAST set "TEST_FAST=1"

if not exist "%ROOT%\logs" mkdir "%ROOT%\logs"
set "LOG=%ROOT%\logs\deploy.log"

> "%LOG%" call :main %*
set "RC=%errorlevel%"
exit /b %RC%

:main
echo [%date% %time%] ============================================================
echo [%date% %time%]  Ultrasound API: развертывание обновления
echo [%date% %time%] ============================================================

rem ----- Проверки -----
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

rem ----- Маркер незавершённого обновления -----
set "MARKER=%ROOT%\deploy\update-in-progress.txt"
> "%MARKER%" echo started %date% %time%
echo [OK] Маркер обновления создан: %MARKER%

rem ============================================================
rem  ФАЗА 1. Подготовка в staging - служба продолжает работать
rem ============================================================
set "STG=%ROOT%\deploy\staging"
set "SWAPPED="

echo [1/10] Распаковываю пакет в staging...
if defined TEST_FAST goto :skip_unpack
rmdir /s /q "%STG%" 2>nul
mkdir "%STG%" 2>nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%STG%' -Force"
if errorlevel 1 (
  echo [ОШИБКА] Не удалось распаковать пакет.
  goto :fail
)
:skip_unpack
if not exist "%STG%\package.json" (
  echo [ОШИБКА] В пакете нет package.json.
  goto :fail
)
if not exist "%STG%\src" (
  echo [ОШИБКА] В пакете нет папки src.
  goto :fail
)

echo [2/10] Устанавливаю зависимости в staging (npm ci)...
if defined TEST_FAST goto :skip_npmci
cd /d "%STG%"
call npm ci
if errorlevel 1 (
  echo [ОШИБКА] npm ci не удался в staging.
  goto :fail
)
:skip_npmci

echo [3/10] Генерирую Prisma Client в staging...
if defined TEST_FAST goto :skip_generate
cd /d "%STG%"
call npx prisma generate
if errorlevel 1 (
  echo [ОШИБКА] prisma generate не удался.
  goto :fail
)
:skip_generate

echo [4/10] Собираю TypeScript в staging...
if defined TEST_FAST goto :skip_build
cd /d "%STG%"
call npm run build
if errorlevel 1 (
  echo [ОШИБКА] Сборка не удалась.
  goto :fail
)
:skip_build

if not exist "%STG%\dist\index.js" (
  echo [ОШИБКА] В staging нет dist\index.js - сборка не выполнена.
  goto :fail
)

rem ============================================================
rem  ФАЗА 2. Переключение (короткое окно, секунды)
rem ============================================================
set "SWAPPED=1"

echo [5/10] Останавливаю службу UltrasoundAPI...
call "%NSSM_EXE%" stop UltrasoundAPI
if errorlevel 1 (
  echo [ОШИБКА] Не удалось остановить службу UltrasoundAPI.
  goto :fail
)

echo [6/10] Создаю резервную копию текущей версии...
set "TS=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TS=%TS: =0%"
set "BK=%ROOT%\backups\backup_%TS%"
mkdir "%BK%" 2>nul
if exist "%ROOT%\src" (
  robocopy "%ROOT%\src" "%BK%\src" /E /NFL /NDL /NJH /NJS /NP >nul
  if errorlevel 8 goto :backup_error
  ver>nul
)
if exist "%ROOT%\prisma" (
  robocopy "%ROOT%\prisma" "%BK%\prisma" /E /NFL /NDL /NJH /NJS /NP >nul
  if errorlevel 8 goto :backup_error
  ver>nul
)
if exist "%ROOT%\dist" (
  robocopy "%ROOT%\dist" "%BK%\dist" /E /NFL /NDL /NJH /NJS /NP >nul
  if errorlevel 8 goto :backup_error
  ver>nul
)
copy /y "%ROOT%\package.json" "%BK%\package.json" >nul
copy /y "%ROOT%\package-lock.json" "%BK%\package-lock.json" >nul
if exist "%ROOT%\tsconfig.json" copy /y "%ROOT%\tsconfig.json" "%BK%\tsconfig.json" >nul
echo [OK] Резервная копия: %BK%

echo [7/10] Переключаю файлы (node_modules, src, prisma, dist)...
rem ---- node_modules: текущий в .old, из staging на место ----
if exist "%ROOT%\node_modules" (
  rmdir /s /q "%ROOT%\node_modules.old" 2>nul
  ren "%ROOT%\node_modules" "node_modules.old"
  if errorlevel 1 (
    echo [ОШИБКА] Не удалось переименовать node_modules.
    goto :fail
  )
)
move "%STG%\node_modules" "%ROOT%\node_modules" >nul 2>&1
if errorlevel 1 (
  rem Другой диск - копируем
  robocopy "%STG%\node_modules" "%ROOT%\node_modules" /E /NFL /NDL /NJH /NJS /NP >nul
  if errorlevel 8 (
    echo [ОШИБКА] Не удалось перенести node_modules.
    goto :fail
  )
  ver>nul
)
rem ---- src ----
if exist "%ROOT%\src" rmdir /s /q "%ROOT%\src"
robocopy "%STG%\src" "%ROOT%\src" /E /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 (
  echo [ОШИБКА] Не удалось скопировать src.
  goto :fail
)
ver>nul
rem ---- prisma ----
if exist "%ROOT%\prisma" rmdir /s /q "%ROOT%\prisma"
robocopy "%STG%\prisma" "%ROOT%\prisma" /E /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 (
  echo [ОШИБКА] Не удалось скопировать prisma.
  goto :fail
)
ver>nul
rem ---- dist ----
if exist "%ROOT%\dist" rmdir /s /q "%ROOT%\dist"
robocopy "%STG%\dist" "%ROOT%\dist" /E /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 (
  echo [ОШИБКА] Не удалось скопировать dist.
  goto :fail
)
ver>nul
rem ---- конфиги ----
copy /y "%STG%\package.json" "%ROOT%\package.json" >nul
copy /y "%STG%\package-lock.json" "%ROOT%\package-lock.json" >nul
if exist "%STG%\tsconfig.json" copy /y "%STG%\tsconfig.json" "%ROOT%\tsconfig.json" >nul
echo [OK] Файлы переключены.

echo [8/10] Применяю миграции Prisma...
if defined TEST_FAST goto :skip_migrate
cd /d "%ROOT%"
call npx prisma migrate deploy
if errorlevel 1 (
  echo [ОШИБКА] Миграции не применились. Проверьте .env и что PostgreSQL запущен.
  goto :fail
)
:skip_migrate

echo [9/10] Запускаю службу и проверяю здоровье...
if not defined TEST_FAST taskkill /F /IM node.exe >nul 2>&1
call "%NSSM_EXE%" start UltrasoundAPI
if errorlevel 1 (
  echo [ОШИБКА] Не удалось запустить службу.
  goto :fail
)
if defined TEST_FAST goto :skip_health
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($i=0;$i -lt 30;$i++){ Start-Sleep -Seconds 3; try { $r=Invoke-RestMethod 'http://localhost:4000/api/health' -TimeoutSec 3; if($r.status -eq 'ok'){ $ok=$true; break } } catch {} }; if(-not $ok){ Write-Error 'API ne otvechaet posle obnovleniya'; exit 1 }"
if errorlevel 1 (
  echo [ОШИБКА] API не отвечает после обновления. Выполняю откат...
  goto :fail
)
:skip_health

echo [10/10] Очищаю временные файлы...
rmdir /s /q "%ROOT%\node_modules.old" 2>nul
call :cleanup

echo.
echo [OK] Обновление успешно завершено.
call :set_state ok "Обновление успешно завершено"
exit /b 0

:backup_error
echo [ОШИБКА] Не удалось создать резервную копию.
goto :fail

:fail
echo.
echo [ОШИБКА] Развертывание прервано. Восстанавливаю предыдущую версию...
if defined SWAPPED (
  if exist "%BK%" (
    if exist "%BK%\src" (
      rmdir /s /q "%ROOT%\src"
      robocopy "%BK%\src" "%ROOT%\src" /E /NFL /NDL /NJH /NJS /NP >nul
    )
    if exist "%BK%\prisma" (
      rmdir /s /q "%ROOT%\prisma"
      robocopy "%BK%\prisma" "%ROOT%\prisma" /E /NFL /NDL /NJH /NJS /NP >nul
    )
    if exist "%BK%\dist" (
      rmdir /s /q "%ROOT%\dist"
      robocopy "%BK%\dist" "%ROOT%\dist" /E /NFL /NDL /NJH /NJS /NP >nul
    )
    copy /y "%BK%\package.json" "%ROOT%\package.json" >nul
    copy /y "%BK%\package-lock.json" "%ROOT%\package-lock.json" >nul
    if exist "%BK%\tsconfig.json" copy /y "%BK%\tsconfig.json" "%ROOT%\tsconfig.json" >nul
    echo [OK] Код восстановлен.
  ) else (
    echo [ВНИМАНИЕ] Резервная копия не найдена.
  )
  rem node_modules: если остался .old - возвращаем
  if exist "%ROOT%\node_modules.old" (
    if exist "%ROOT%\node_modules" rmdir /s /q "%ROOT%\node_modules"
    ren "%ROOT%\node_modules.old" "node_modules"
    echo [OK] node_modules восстановлен.
  )
  echo Запускаю службу UltrasoundAPI...
  if not defined TEST_FAST taskkill /F /IM node.exe >nul 2>&1
  call "%NSSM_EXE%" start UltrasoundAPI >nul 2>&1
) else (
  echo [INFO] Служба не останавливалась - ничего не меняем.
)
call :cleanup
echo.
echo [ОШИБКА] Развертывание завершилось с ошибкой (см. лог выше).
call :set_state failed "Развертывание завершилось с ошибкой (см. лог)"
exit /b 1

:cleanup
if exist "%MARKER%" del /q "%MARKER%"
rmdir /s /q "%ROOT%\deploy\staging" 2>nul
exit /b 0

:set_state
rem Обновляет deploy\state.json: аргумент 1 - статус, аргумент 2 - сообщение
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%ROOT%\deploy\state.json'; try { $s = Get-Content -LiteralPath $p -Raw -ErrorAction Stop | ConvertFrom-Json } catch { $s = [PSCustomObject]@{} }; $s | Add-Member -NotePropertyName status -NotePropertyValue '%~1' -Force; $s | Add-Member -NotePropertyName finishedAt -NotePropertyValue (Get-Date).ToString('o') -Force; $s | Add-Member -NotePropertyName message -NotePropertyValue '%~2' -Force; $s | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $p -Encoding UTF8"
exit /b 0

