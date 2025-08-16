import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { setupIpcHandlers } from './ipc-handlers';
import { setupMenu } from './menu';
import { ConfigManager } from './config';
import { AuthManager } from './auth-manager';
import Store from 'electron-store';

// Set UTF-8 encoding for console output on Windows
if (process.platform === 'win32' && process.stdout && process.stdout.setEncoding) {
    try {
        process.stdout.setEncoding('utf8');
        process.stderr.setEncoding('utf8');
    } catch (error) {
        // Encoding methods not available in Electron main process
        console.log('Note: Unable to set console encoding in Electron environment');
    }
}

console.log('Oxygen: Starting main process...');
console.log('Oxygen: __dirname:', __dirname);

// Initialize store for settings
const store = new Store();

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    console.log('Oxygen: Creating window...');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false, // Remove default title bar
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: false, // Allow file:// access for media playback
            allowRunningInsecureContent: true,
            experimentalFeatures: true
        },
        icon: path.join(__dirname, '../../resources/icons/icon.ico'),
        title: 'Oxygen',
        show: false,
        // Additional frameless window options
        transparent: false,
        backgroundColor: '#000000',
        resizable: true,
        maximizable: true,
        minimizable: true,
        closable: true,
    });

    console.log('Oxygen: Window created');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        console.log('Oxygen: Window ready to show');
        mainWindow?.show();
    });

    // Load the app
    if (isDev) {
        const url = 'http://localhost:9800';
        console.log('Oxygen: Loading dev URL:', url);
        mainWindow.loadURL(url).catch(err => {
            console.error('Oxygen: Failed to load URL:', err);
        });
        
        // Open DevTools after content is loaded to avoid errors
        mainWindow.webContents.once('did-finish-load', () => {
            mainWindow?.webContents.openDevTools();
        });
    } else {
        const indexPath = path.join(__dirname, '../renderer/index.html');
        console.log('Oxygen: Loading file:', indexPath);
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Oxygen: Failed to load file:', err);
        });
    }

    // Handle window closed
    mainWindow.on('closed', () => {
        console.log('Oxygen: Window closed');
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Suppress DevTools errors in development
    if (isDev) {
        mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
            // Filter out DevTools-related errors
            if (sourceId && sourceId.includes('devtools://') && message.includes('Failed to fetch')) {
                event.preventDefault();
                return;
            }
        });
    }

    // Setup menu (disabled for minimal design)
    // setupMenu(mainWindow);
    
    // Set empty menu for minimal design
    mainWindow.setMenu(null);
}

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Oxygen: Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Oxygen: Unhandled Rejection:', error);
});

// App event handlers
app.whenReady().then(async () => {
    console.log('Oxygen: App ready');

    try {
        // Initialize managers
        const configManager = new ConfigManager(store);
        const authManager = new AuthManager();

        // Setup IPC handlers
        setupIpcHandlers(configManager, authManager);

        createWindow();
    } catch (error) {
        console.error('Oxygen: Error during initialization:', error);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    console.log('Oxygen: All windows closed');
    // Force quit on all platforms to prevent zombie processes
    app.quit();
});

// Handle app quit to ensure clean shutdown
app.on('before-quit', (event) => {
    console.log('Oxygen: Before quit event');
    
    // Cancel any ongoing downloads to prevent orphaned processes
    if (mainWindow && !mainWindow.isDestroyed()) {
        try {
            mainWindow.webContents.send('app:before-quit');
        } catch (error) {
            console.debug('Error sending before-quit event:', error);
        }
    }
    BrowserWindow.getAllWindows().forEach(window => {
        window.destroy();
    });
});

app.on('will-quit', (event) => {
    console.log('Oxygen: Will quit event');
    // Perform any final cleanup here
});

// Ensure the app quits properly when the main window is closed
app.on('quit', () => {
    console.log('Oxygen: App quit event');
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
});

// Handle protocol for deep linking (optional)
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('oxygen', process.execPath, [
            path.resolve(process.argv[1]),
        ]);
    }
} else {
    app.setAsDefaultProtocolClient('oxygen');
}

console.log('Oxygen: Main process initialized');