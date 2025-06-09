#!/bin/bash

echo "Setting up Oxygen development environment..."
echo

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="darwin"
fi

echo "Detected OS: $OS"
echo

# Create directory structure
echo "Step 1: Creating directory structure..."
mkdir -p resources/binaries/win32
mkdir -p resources/binaries/darwin
mkdir -p resources/binaries/linux
mkdir -p build

echo
echo "Step 2: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies!"
    exit 1
fi

echo
echo "Step 3: Downloading binaries for $OS..."

if [ "$OS" == "darwin" ]; then
    # Download yt-dlp for macOS
    if [ ! -f "resources/binaries/darwin/yt-dlp" ]; then
        echo "Downloading yt-dlp for macOS..."
        curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos -o resources/binaries/darwin/yt-dlp
        chmod +x resources/binaries/darwin/yt-dlp
    fi

    # Check for ffmpeg
    if [ ! -f "resources/binaries/darwin/ffmpeg" ]; then
        echo "WARNING: ffmpeg not found in resources/binaries/darwin/"
        echo "Please install with: brew install ffmpeg"
        echo "Then copy to resources/binaries/darwin/"
    fi

elif [ "$OS" == "linux" ]; then
    # Download yt-dlp for Linux
    if [ ! -f "resources/binaries/linux/yt-dlp" ]; then
        echo "Downloading yt-dlp for Linux..."
        curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o resources/binaries/linux/yt-dlp
        chmod +x resources/binaries/linux/yt-dlp
    fi

    # Check for ffmpeg
    if [ ! -f "resources/binaries/linux/ffmpeg" ]; then
        echo "WARNING: ffmpeg not found in resources/binaries/linux/"
        echo "Please install with: sudo apt-get install ffmpeg"
        echo "Then copy to resources/binaries/linux/"
    fi
fi

echo
echo "Step 4: Checking for Windows binaries (for cross-platform builds)..."
if [ ! -f "resources/binaries/win32/yt-dlp.exe" ]; then
    echo "WARNING: yt-dlp.exe not found in resources/binaries/win32/"
    echo "Download from: https://github.com/yt-dlp/yt-dlp/releases"
fi

if [ ! -f "resources/binaries/win32/ffmpeg.exe" ]; then
    echo "WARNING: ffmpeg.exe not found in resources/binaries/win32/"
    echo "Download from: https://ffmpeg.org/download.html"
fi

echo
echo "Step 5: Creating placeholder icon if needed..."
if [ ! -f "build/icon.png" ]; then
    echo "WARNING: icon.png not found in build/"
    echo "Please add your application icon as build/icon.png"
fi

echo
echo "Setup completed!"
echo
echo "Next steps:"
echo "1. Ensure all binaries are in place"
echo "2. Add your application icon"
echo "3. Run 'npm run dev' to start development"
echo "4. Run 'npm run dist' to build for your platform"
echo

# Make build scripts executable
chmod +x build-*.sh 2>/dev/null || true