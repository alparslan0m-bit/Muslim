@echo off
REM Islamic Prayer Focus App - Run Script
REM This script sets up and runs the development environment

echo.
echo ====================================
echo  Islamic Prayer Focus App
echo  Development Server Startup
echo ====================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js and npm from https://nodejs.org
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
)

REM Start the development server
echo.
echo Starting development server...
echo Press Ctrl+C to stop
echo.

call npm run dev

pause
