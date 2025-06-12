#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(rootDir, 'release');

console.log('🚀 Building Oxygen Portable...\n');

// Step 1: Kill any existing processes
console.log('🔪 Killing any running Electron processes...');
if (process.platform === 'win32') {
  try {
    execSync('taskkill /f /im electron.exe 2>nul', { stdio: 'pipe' });
    execSync('taskkill /f /im Oxygen.exe 2>nul', { stdio: 'pipe' });
  } catch (e) {
    // Ignore
  }
} else {
  try {
    execSync('pkill -f electron || true', { stdio: 'pipe' });
    execSync('pkill -f Oxygen || true', { stdio: 'pipe' });
  } catch (e) {
    // Ignore
  }
}

// Step 2: Clean output directory
console.log('🗑️  Cleaning output directory...');
if (fs.existsSync(outDir)) {
  try {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${outDir}"`, { stdio: 'pipe' });
    } else {
      // Try without sudo first
      try {
        execSync(`rm -rf "${outDir}"`, { stdio: 'pipe' });
      } catch (e) {
        console.log('⚠️  Normal cleanup failed, trying with sudo...');
        execSync(`sudo rm -rf "${outDir}"`, { stdio: 'inherit' });
      }
    }
  } catch (e) {
    console.error('⚠️  Failed to clean output directory, continuing anyway...');
  }
}

// Step 3: Build TypeScript
console.log('\n📦 Building TypeScript...');
try {
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
} catch (e) {
  console.error('❌ TypeScript build failed');
  process.exit(1);
}

// Step 4: Build portable app
console.log('\n🏗️  Building portable executable...');
try {
  execSync('npx electron-builder --win portable -c config/electron-builder-portable.json', {
    cwd: rootDir,
    stdio: 'inherit'
  });
  
  console.log('\n✅ Build completed successfully!');
  console.log('📁 Output files are in the "out" directory');
  
  // List output files
  if (fs.existsSync(outDir)) {
    const files = fs.readdirSync(outDir);
    console.log('\n📋 Generated files:');
    files.forEach(file => {
      const filePath = path.join(outDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const size = (stat.size / 1024 / 1024).toFixed(2);
        console.log(`   - ${file} (${size} MB)`);
      }
    });
  }
} catch (e) {
  console.error('\n❌ Portable build failed');
  console.error('💡 Tip: Make sure Wine is installed if building on Linux/WSL');
  console.error('   Run: sudo apt-get install wine wine32');
  process.exit(1);
}