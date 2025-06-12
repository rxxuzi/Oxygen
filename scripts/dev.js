const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

console.log('🚀 Starting Oxygen Development Environment...\n');

// Set NODE_ENV
process.env.NODE_ENV = 'development';

// Colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

// Check if port is in use
async function isPortInUse(port) {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', () => resolve(true))
            .once('listening', () => {
                tester.once('close', () => resolve(false)).close();
            })
            .listen(port);
    });
}

// Kill process on port
async function killPort(port) {
    try {
        if (process.platform === 'win32') {
            execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
                .split('\n')
                .forEach(line => {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && !isNaN(pid)) {
                        try {
                            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                        } catch (e) {}
                    }
                });
        }
    } catch (e) {}
}

// Ensure dist directories exist
const rootDir = path.join(__dirname, '..');
const dirs = ['dist', 'dist/main', 'dist/preload', 'dist/renderer', 'dist/shared'];
dirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) {
        console.log(`${colors.yellow}Creating ${dir} directory...${colors.reset}`);
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Helper function
function runCommand(command, args, label, color) {
    console.log(`${color}[${label}] Starting...${colors.reset}`);

    const proc = spawn(command, args, {
        shell: true,
        cwd: rootDir,
        env: { ...process.env, FORCE_COLOR: '1' }
    });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
            if (!line.includes('deprecated') && !line.includes('CJS build')) {
                console.log(`${color}[${label}]${colors.reset} ${line}`);
            }
        });
    });

    proc.stderr.on('data', (data) => {
        const str = data.toString();
        if (!str.includes('deprecated') && !str.includes('ExperimentalWarning')) {
            console.error(`${colors.red}[${label}]${colors.reset} ${str.trim()}`);
        }
    });

    proc.on('error', (error) => {
        console.error(`${colors.red}[${label}] Error: ${error.message}${colors.reset}`);
    });

    return proc;
}

// Main function
async function main() {
    // Check and kill port 9800 if in use
    const portInUse = await isPortInUse(9800);
    if (portInUse) {
        console.log(`${colors.yellow}Port 9800 is in use, attempting to free it...${colors.reset}`);
        await killPort(9800);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Start Vite dev server
    const viteCmd = process.platform === 'win32' ? 
        path.join(rootDir, 'node_modules', '.bin', 'vite.cmd') : 
        path.join(rootDir, 'node_modules', '.bin', 'vite');
    const vite = runCommand(viteCmd, ['-c', 'config/vite.config.ts', '--host', '127.0.0.1'], 'Vite', colors.green);

    // Start TypeScript compiler
    const tscCmd = process.platform === 'win32' ? 
        path.join(rootDir, 'node_modules', '.bin', 'tsc.cmd') : 
        path.join(rootDir, 'node_modules', '.bin', 'tsc');
    const tsc = runCommand(tscCmd, ['-w', '-p', 'config/tsconfig.main.json'], 'TSC', colors.blue);

    // Watch for successful compilation to start Electron
    let electronStarted = false;
    let electronProcess = null;
    let compilationSuccess = false;

    tsc.stdout.on('data', (data) => {
        const output = data.toString();

        // Check if compilation is successful
        if (output.includes('Found 0 errors')) {
            compilationSuccess = true;
            console.log(`${colors.green}[TSC] Compilation successful!${colors.reset}`);

            if (!electronStarted && compilationSuccess) {
                electronStarted = true;

                // Wait for Vite to be ready
                setTimeout(() => {
                    // Check if main.js exists
                    const mainPath = path.join(rootDir, 'dist/main/main.js');
                    if (!fs.existsSync(mainPath)) {
                        console.error(`${colors.red}[Error] main.js not found at ${mainPath}${colors.reset}`);
                        console.log(`${colors.yellow}[Info] Current dist structure:${colors.reset}`);
                        showDirStructure(path.join(rootDir, 'dist'));
                        return;
                    }

                    console.log(`\n${colors.bright}${colors.yellow}📱 Starting Electron...${colors.reset}\n`);

                    electronProcess = runCommand('npx', ['electron', rootDir], 'Electron', colors.yellow);

                    electronProcess.on('close', (code) => {
                        console.log(`\n${colors.yellow}Electron closed with code ${code}${colors.reset}`);
                        cleanup();
                    });

                    electronProcess.stderr.on('data', (data) => {
                        console.error(`${colors.red}[Electron Error]${colors.reset} ${data.toString()}`);
                    });
                }, 3000);
            }
        }
    });

    // Vite ready handler
    vite.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('ready in') || output.includes('Local:')) {
            console.log(`${colors.green}[Vite] Dev server ready!${colors.reset}`);
        }
    });
}

// Show directory structure
function showDirStructure(dir, indent = '') {
    if (!fs.existsSync(dir)) {
        console.log(`${indent}${colors.red}Directory not found: ${dir}${colors.reset}`);
        return;
    }

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            console.log(`${indent}📁 ${file}/`);
            showDirStructure(filePath, indent + '  ');
        } else {
            console.log(`${indent}📄 ${file}`);
        }
    });
}

// Cleanup function
function cleanup() {
    console.log(`\n${colors.red}Shutting down...${colors.reset}`);

    // Kill all processes
    ['vite', 'tsc', 'electron'].forEach(name => {
        try {
            if (process.platform === 'win32') {
                execSync(`taskkill /F /IM ${name}.exe`, { stdio: 'ignore' });
            }
        } catch (e) {}
    });

    process.exit(0);
}

// Handle exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Instructions
console.log(`${colors.bright}📋 Development server starting...${colors.reset}`);
console.log(`${colors.cyan}• Vite server: http://localhost:9800${colors.reset}`);
console.log(`${colors.cyan}• Electron will start after TypeScript compilation${colors.reset}`);
console.log(`${colors.cyan}• Press Ctrl+C to stop all processes${colors.reset}\n`);

// Start the development environment
main().catch(error => {
    console.error(`${colors.red}Failed to start: ${error.message}${colors.reset}`);
    process.exit(1);
});