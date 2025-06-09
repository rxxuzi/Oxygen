#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DistributionBuilder {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.outDir = path.join(this.rootDir, 'out');
    this.distDir = path.join(this.rootDir, 'dist');
  }

  log(message) {
    console.log(`[DIST] ${message}`);
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async killElectronProcesses() {
    this.log('Killing any running Electron processes...');
    
    if (process.platform === 'win32') {
      // Windows: Use PowerShell for more reliable process killing
      const killCommands = [
        `powershell -Command "Get-Process -Name 'electron', 'Oxygen' -ErrorAction SilentlyContinue | Stop-Process -Force"`,
        `taskkill /f /im electron.exe 2>nul || echo "No electron processes"`,
        `taskkill /f /im Oxygen.exe 2>nul || echo "No Oxygen processes"`,
        `taskkill /f /im node.exe /fi "WINDOWTITLE eq Oxygen*" 2>nul || echo "No node processes"`
      ];
      
      for (const cmd of killCommands) {
        try {
          execSync(cmd, { stdio: 'pipe' });
        } catch (e) {
          // Ignore errors
        }
      }
    } else {
      // Unix-like systems
      try {
        execSync(`pkill -f "electron.*oxygen" || true`, { stdio: 'pipe' });
        execSync(`pkill -f "Oxygen" || true`, { stdio: 'pipe' });
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Wait a bit for processes to fully terminate
    await this.sleep(1000);
  }

  async forceRemoveDirectory(dirPath, maxRetries = 5) {
    // First, try to kill any Electron processes
    await this.killElectronProcesses();
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (fs.existsSync(dirPath)) {
          this.log(`Attempting to remove ${dirPath} (attempt ${attempt}/${maxRetries})`);
          
          if (process.platform === 'win32') {
            // Windows: Try multiple removal methods
            const removalCommands = [
              `rmdir /s /q "${dirPath}" 2>nul`,
              `powershell -Command "Remove-Item -Path '${dirPath}' -Recurse -Force -ErrorAction SilentlyContinue"`,
              `del /f /s /q "${dirPath}\\*" 2>nul && rmdir /s /q "${dirPath}" 2>nul`
            ];
            
            for (const cmd of removalCommands) {
              try {
                execSync(cmd, { stdio: 'pipe' });
                if (!fs.existsSync(dirPath)) {
                  break;
                }
              } catch (e) {
                // Try next method
              }
            }
          } else {
            // Unix-like systems: Handle permission issues
            try {
              // First try normal removal
              execSync(`rm -rf "${dirPath}"`, { stdio: 'pipe' });
            } catch (e) {
              // If that fails, try with sudo (will prompt for password)
              this.log('Normal removal failed, trying with elevated permissions...');
              try {
                execSync(`sudo rm -rf "${dirPath}"`, { stdio: 'inherit' });
              } catch (e2) {
                // Last resort: change permissions and try again
                execSync(`chmod -R 777 "${dirPath}" 2>/dev/null || true`, { stdio: 'pipe' });
                execSync(`rm -rf "${dirPath}"`, { stdio: 'pipe' });
              }
            }
          }
          
          // Verify removal
          if (!fs.existsSync(dirPath)) {
            this.log(`Successfully removed ${dirPath}`);
            return true;
          }
        } else {
          this.log(`Directory ${dirPath} does not exist, skipping removal`);
          return true;
        }
      } catch (error) {
        this.error(`Failed to remove ${dirPath} on attempt ${attempt}: ${error.message}`);
        
        if (attempt < maxRetries) {
          // Kill processes again before retry
          await this.killElectronProcesses();
          this.log(`Waiting 3 seconds before retry...`);
          await this.sleep(3000);
        }
      }
    }
    
    this.error(`Failed to remove ${dirPath} after ${maxRetries} attempts`);
    this.error(`Try manually closing all Electron/Oxygen processes and run again`);
    return false;
  }

  async cleanOutputDirectories() {
    this.log('Cleaning output directories...');
    
    const success1 = await this.forceRemoveDirectory(this.outDir);
    const success2 = await this.forceRemoveDirectory(this.distDir);
    
    if (!success1 || !success2) {
      this.error('Failed to clean some directories, but continuing...');
    }
    
    // Recreate dist directory for TypeScript compilation
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      this.log(`Running: ${command}`);
      
      const child = spawn(command, {
        shell: true,
        stdio: 'inherit',
        cwd: this.rootDir,
        ...options
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${command}`));
        }
      });
      
      child.on('error', (error) => {
        reject(new Error(`Failed to execute command: ${error.message}`));
      });
    });
  }

  async buildTypeScript() {
    this.log('Building TypeScript...');
    try {
      await this.runCommand('npm run build');
      this.log('TypeScript build completed successfully');
    } catch (error) {
      throw new Error(`TypeScript build failed: ${error.message}`);
    }
  }

  async packageWithElectronBuilder(platform = 'win') {
    this.log(`Packaging for ${platform}...`);
    
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.log(`Packaging attempt ${attempt}/${maxRetries}`);
        
        // Run electron-builder directly
        const platformFlag = platform === 'win' ? '--win' : 
                            platform === 'mac' ? '--mac' : 
                            platform === 'linux' ? '--linux' : '--win';
        
        const command = `npx electron-builder ${platformFlag} -c config/electron-builder.json`;
        await this.runCommand(command);
        
        this.log('Packaging completed successfully!');
        return true;
        
      } catch (error) {
        lastError = error;
        this.error(`Packaging attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < maxRetries) {
          this.log('Cleaning up before retry...');
          await this.forceRemoveDirectory(this.outDir);
          this.log(`Waiting 3 seconds before retry...`);
          await this.sleep(3000);
        }
      }
    }
    
    throw new Error(`Packaging failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
  }

  async verifyOutput() {
    this.log('Verifying output...');
    
    const expectedPaths = [
      path.join(this.outDir, 'win-unpacked'),
      path.join(this.outDir, 'oxygen Setup *.exe')
    ];
    
    let foundFiles = [];
    
    try {
      const outFiles = fs.readdirSync(this.outDir);
      foundFiles = outFiles.map(f => path.join(this.outDir, f));
      
      this.log('Generated files:');
      foundFiles.forEach(file => {
        const stats = fs.statSync(file);
        const size = stats.isDirectory() ? '[DIR]' : `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
        this.log(`  - ${path.basename(file)} (${size})`);
      });
      
    } catch (error) {
      this.error(`Failed to verify output: ${error.message}`);
    }
  }

  async build(platform = 'win') {
    const startTime = Date.now();
    this.log(`Starting distribution build for ${platform}...`);
    
    try {
      // Step 1: Clean output directories
      await this.cleanOutputDirectories();
      
      // Step 2: Build TypeScript
      await this.buildTypeScript();
      
      // Step 3: Package with electron-builder
      await this.packageWithElectronBuilder(platform);
      
      // Step 4: Verify output
      await this.verifyOutput();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.log(`Distribution build completed successfully in ${duration}s`);
      
    } catch (error) {
      this.error(`Distribution build failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Parse command line arguments
const platform = process.argv[2] || 'win';
const validPlatforms = ['win', 'mac', 'linux'];

if (!validPlatforms.includes(platform)) {
  console.error(`Invalid platform: ${platform}. Valid options: ${validPlatforms.join(', ')}`);
  process.exit(1);
}

// Create and run the builder
const builder = new DistributionBuilder();
builder.build(platform).catch(error => {
  console.error('Build failed:', error.message);
  process.exit(1);
});