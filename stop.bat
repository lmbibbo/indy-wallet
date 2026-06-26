@echo off
title Indy Wallet - Shutdown Script
chcp 65001 > nul

echo Deteniendo servicios de Indy Wallet...
echo.

:kill_port
for %%p in (8080 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p') do (
        echo    -^> Puerto %%p (PID: %%a)...
        taskkill /F /PID %%a >nul 2>nul
    )
)

echo.
echo Listo.
pause
