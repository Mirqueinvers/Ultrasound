@echo off
setlocal
chcp 65001 >nul
title Ultrasound API - удаление сервера

net session >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Запустите скрипт от имени администратора.
  pause
  exit /b 1
)

set "NSSM_EXE=%~dp0nssm.exe"
if not exist "%NSSM_EXE%" (
  echo nssm.exe не найден - служба, возможно, не установлена.
) else (
  echo Останавливаю службу UltrasoundAPI...
  "%NSSM_EXE%" stop UltrasoundAPI
  echo Удаляю службу UltrasoundAPI...
  "%NSSM_EXE%" remove UltrasoundAPI confirm
)

echo.
echo Удаляю правило брандмауэра (если есть)...
netsh advfirewall firewall delete rule name="Ultrasound API 4000" >nul 2>&1

echo.
echo [OK] Служба удалена. Данные в PostgreSQL не удаляются.
echo     При необходимости закройте службу PostgreSQL или удалите её в панели управления.
pause
