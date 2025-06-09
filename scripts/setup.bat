@echo off
echo Setting up Oxygen development environment...
echo.

echo Step 1: Creating directory structure...
mkdir resources\binaries\win32 2>nul
mkdir resources\binaries\darwin 2>nul
mkdir resources\binaries\linux 2>nul
mkdir build 2>nul

echo.
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo Step 3: Checking for binaries...
if not exist "resources\binaries\win32\yt-dlp.exe" (
    echo WARNING: yt-dlp.exe not found in resources\binaries\win32\
    echo Please download from: https://github.com/yt-dlp/yt-dlp/releases
    echo.
)

if not exist "resources\binaries\win32\ffmpeg.exe" (
    echo WARNING: ffmpeg.exe not found in resources\binaries\win32\
    echo Please download from: https://ffmpeg.org/download.html
    echo.
)

echo.
echo Step 4: Creating placeholder icon if needed...
if not exist "build\icon.ico" (
    echo WARNING: icon.ico not found in build\
    echo Please add your application icon as build\icon.ico
    echo.
)

echo.
echo Setup completed!
echo.
echo Next steps:
echo 1. Add yt-dlp.exe and ffmpeg.exe to resources\binaries\win32\
echo 2. Add your application icon as build\icon.ico
echo 3. Run 'npm run dev' to start development
echo 4. Run 'build-win.bat' to build for Windows
echo.
pause
exit /b 0

:error
echo.
echo Setup failed! Check the error messages above.
pause
exit /b 1