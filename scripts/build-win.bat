@echo off
echo Building Oxygen for Windows...
echo.

echo Step 1: Cleaning previous builds...
call npm run clean
if errorlevel 1 goto error

echo.
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo Step 3: Building application...
call npm run build
if errorlevel 1 goto error

echo.
echo Step 4: Creating Windows distributables...
call npm run dist:win
if errorlevel 1 goto error

echo.
echo Build completed successfully!
echo Check the 'out' directory for the built files.
echo.
pause
exit /b 0

:error
echo.
echo Build failed! Check the error messages above.
pause
exit /b 1