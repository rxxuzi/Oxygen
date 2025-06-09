#!/bin/bash

echo "Building Oxygen for macOS..."
echo

echo "Step 1: Cleaning previous builds..."
npm run clean
if [ $? -ne 0 ]; then
    echo "Clean failed!"
    exit 1
fi

echo
echo "Step 2: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies!"
    exit 1
fi

echo
echo "Step 3: Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo
echo "Step 4: Creating macOS distributables..."
npm run dist -- --mac
if [ $? -ne 0 ]; then
    echo "Distribution build failed!"
    exit 1
fi

echo
echo "Build completed successfully!"
echo "Check the 'out' directory for the built files:"
echo "  - Oxygen-*.dmg (Installer)"
echo "  - Oxygen.app (Application bundle)"
echo

# Open the output directory
open out/