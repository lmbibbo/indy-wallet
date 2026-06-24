@echo off
title Indy Wallet - Startup Script
chcp 65001 > nul

echo ===================================================
echo   Arrancando servicios de Indy Wallet en Windows   
echo ===================================================
echo.

:: --- Limpieza de puerto 5173 ---
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo ==^> Puerto 5173 ocupado, matando proceso anterior ^(PID: %%a^)...
    taskkill /F /PID %%a >nul 2>nul
)

:: --- Backend ---
set "BACKEND_JAR=indy-project\indy-backend\target\wallet-0.0.1-SNAPSHOT.jar"

if exist "%BACKEND_JAR%" (
    echo ==^> Arrancando backend [Spring Boot - JAR]...
    start "Indy Backend" java -jar "%BACKEND_JAR%"
) else (
    echo ==^> Arrancando backend [Spring Boot - Maven]...
    pushd indy-project\indy-backend
    start "Indy Backend" cmd /c "mvnw.cmd spring-boot:run -DskipTests"
    popd
)

:: --- Frontend ---
echo ==^> Arrancando frontend [Vite]...
pushd indy-project\indy-frontend
start "Indy Frontend" cmd /c "npm run dev"
popd

echo.
echo ===================================================
echo   Servicios iniciados en ventanas separadas:
echo     - Backend:  http://localhost:8080
echo     - Frontend: http://localhost:5173
echo ===================================================
echo.
pause
