import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
// import log from 'electron-log';

export class AutoUpdater {
    private mainWindow: BrowserWindow | null = null;

    constructor() {
        // Configure logging
        // log.transports.file.level = 'info';
        // autoUpdater.logger = log;

        // Disable auto download
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;
    }

    setWindow(window: BrowserWindow) {
        this.mainWindow = window;
    }

    setupUpdater() {
        // Check for updates on startup
        this.checkForUpdates();

        // Check for updates every hour
        setInterval(() => {
            this.checkForUpdates();
        }, 60 * 60 * 1000);

        // Update events
        autoUpdater.on('checking-for-update', () => {
            console.log('Checking for update...');
        });

        autoUpdater.on('update-available', (info) => {
            console.log('Update available:', info);

            dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'Update Available',
                message: `A new version ${info.version} is available. Would you like to download it?`,
                buttons: ['Download', 'Later'],
                defaultId: 0,
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.downloadUpdate();
                }
            });
        });

        autoUpdater.on('update-not-available', () => {
            console.log('Update not available.');
        });

        autoUpdater.on('error', (err) => {
            console.error('Error in auto-updater:', err);
        });

        autoUpdater.on('download-progress', (progressObj) => {
            let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
            logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
            logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
            console.log(logMessage);

            // Send progress to renderer
            if (this.mainWindow) {
                this.mainWindow.webContents.send('update-download-progress', progressObj);
            }
        });

        autoUpdater.on('update-downloaded', (info) => {
            console.log('Update downloaded:', info);

            dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'Update Ready',
                message: 'Update downloaded. The application will restart to apply the update.',
                buttons: ['Restart Now', 'Later'],
                defaultId: 0,
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        });
    }

    checkForUpdates() {
        autoUpdater.checkForUpdatesAndNotify();
    }
}