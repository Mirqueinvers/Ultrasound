@echo off
setlocal
chcp 65001 >nul
title Ultrasound - обновление сервера по локальной сети

rem ============================================================
rem  Отправка обновления на удалённый сервер по локальной сети
rem  Использование:  deploy-lan.bat <IP-сервера> [DEPLOY_TOKEN]
rem  Пример:         deploy-lan.bat 192.168.1.50 my-secret-token
rem ============================================================

if "%~1"=="" (
  echo Использование: deploy-lan.bat ^<IP-сервера^> [DEPLOY_TOKEN]
  echo Пример:        deploy-lan.bat 192.168.1.50 my-secret-token
  pause
  exit /b 1
)
set "SERVER_HOST=%~1"
set "DEPLOY_TOKEN=%~2"

cd /d "%~dp0.."
set "ROOT=%CD%"

if not exist "%ROOT%\package.json" (
  echo [ОШИБКА] Не найден package.json. Скрипт должен лежать в Server\deploy\.
  pause
  exit /b 1
)

echo Собираю пакет обновления (src, prisma, package.json, package-lock.json, tsconfig.json)...
if exist "%ROOT%\deploy-package.zip" del /q "%ROOT%\deploy-package.zip"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Compress-Archive -Path '%ROOT%\src','%ROOT%\prisma','%ROOT%\package.json','%ROOT%\package-lock.json','%ROOT%\tsconfig.json' -DestinationPath '%ROOT%\deploy-package.zip' -Force"
if errorlevel 1 (
  echo [ОШИБКА] Не удалось собрать архив. Убедитесь, что все файлы на месте.
  pause
  exit /b 1
)
echo [OK] Пакет: %ROOT%\deploy-package.zip

echo.
echo Отправляю на http://%SERVER_HOST%:4000/api/deploy ...
curl.exe -s -X POST -H "x-deploy-token: %DEPLOY_TOKEN%" -H "Content-Type: application/octet-stream" --data-binary "@%ROOT%\deploy-package.zip" http://%SERVER_HOST%:4000/api/deploy
echo.
echo.
echo Следите за ходом обновления: http://%SERVER_HOST%:4000/deploy
echo (на этой же странице отображается лог обновления)
pause
