// Electron entry point router
const fs = require('fs');
const path = require('path');

console.log('[Oxygen] Starting application...');

// Root directory is one level up from scripts/
const rootDir = path.join(__dirname, '..');

// Possible main.js locations
const possiblePaths = [
    './dist/main/main.js',
    './dist/main.js',
    './build/main/main.js'
];

let mainPath = null;

// Find the correct main.js
for (const testPath of possiblePaths) {
    const fullPath = path.join(rootDir, testPath);
    console.log(`[Oxygen] Checking: ${fullPath}`);

    if (fs.existsSync(fullPath)) {
        mainPath = fullPath;
        console.log(`[Oxygen] Found main.js at: ${testPath}`);
        break;
    }
}

if (mainPath) {
    // Load the actual main file
    require(mainPath);
} else {
    console.error('[Oxygen] ERROR: Could not find main.js!');
    console.error('[Oxygen] Searched paths:', possiblePaths);
    console.error('[Oxygen] Root directory:', rootDir);
    console.error('[Oxygen] Directory contents:');

    // Show directory structure for debugging
    function showDir(dir, indent = '') {
        if (fs.existsSync(dir)) {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                console.error(`${indent}${stat.isDirectory() ? '📁' : '📄'} ${item}`);
                if (stat.isDirectory() && item === 'dist') {
                    showDir(itemPath, indent + '  ');
                }
            });
        }
    }

    showDir(rootDir);

    console.error('\n[Oxygen] Please run: npm run build');
    process.exit(1);
}