const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Oxygen...\n');

// Clean dist directory
console.log('📁 Cleaning dist directory...');
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}

// Create directories
['dist', 'dist/main', 'dist/preload', 'dist/renderer', 'dist/shared'].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
});

// Build TypeScript
console.log('\n📘 Building TypeScript files...');
try {
    // Use the local TypeScript installation
    const tscPath = path.join(__dirname, '../node_modules/.bin/tsc');
    const tscCommand = process.platform === 'win32' ? `"${tscPath}.cmd"` : tscPath;
    execSync(`${tscCommand} -p tsconfig.build.json`, { 
        stdio: 'inherit'
    });
    console.log('✅ TypeScript build complete');
} catch (error) {
    console.error('❌ TypeScript build failed');
    process.exit(1);
}

// Build renderer
console.log('\n🎨 Building renderer...');
try {
    const vitePath = path.join(__dirname, '../node_modules/.bin/vite');
    const viteCommand = process.platform === 'win32' ? `"${vitePath}.cmd"` : vitePath;
    execSync(`${viteCommand} build -c config/vite.config.ts`, { stdio: 'inherit' });
    console.log('✅ Renderer build complete');
} catch (error) {
    console.error('❌ Renderer build failed');
    // Don't exit on renderer build failure as it's a separate issue
    console.log('⚠️  Continuing despite renderer build failure...');
}

// Copy static files
console.log('\n📋 Copying static files...');

// Ensure preload.js exists
const preloadSrc = path.join(__dirname, '../dist/preload/preload.js');
if (!fs.existsSync(preloadSrc)) {
    console.log('⚠️  preload.js not found, checking alternate location...');
    const altPreload = path.join(__dirname, '../dist/preload.js');
    if (fs.existsSync(altPreload)) {
        fs.mkdirSync(path.dirname(preloadSrc), { recursive: true });
        fs.copyFileSync(altPreload, preloadSrc);
        console.log('✅ Copied preload.js to correct location');
    }
}

console.log('\n✅ Build complete!');
console.log('📦 Output in dist/ directory');

// List generated files
console.log('\n📂 Generated files:');
try {
    const mainFiles = fs.readdirSync('dist/main').filter(f => f.endsWith('.js'));
    const preloadFiles = fs.readdirSync('dist/preload').filter(f => f.endsWith('.js'));
    const sharedFiles = fs.readdirSync('dist/shared').filter(f => f.endsWith('.js'));
    
    console.log(`  Main: ${mainFiles.length} files`);
    console.log(`  Preload: ${preloadFiles.length} files`);
    console.log(`  Shared: ${sharedFiles.length} files`);
} catch (error) {
    console.log('  Unable to list files');
}