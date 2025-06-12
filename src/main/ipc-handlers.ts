import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import { Downloader } from './downloader';
import { ConfigManager } from './config';
import { AuthManager } from './auth-manager';
import { FileManager } from './file-manager';
import { DownloadOptions, Settings } from '../shared/types';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import path from 'path';

export function setupIpcHandlers(configManager: ConfigManager, authManager: AuthManager) {
    const downloader = new Downloader();
    const fileManager = new FileManager();

    // Download handlers
    ipcMain.handle(IPC_CHANNELS.DOWNLOAD_START, async (event, url: string, options: DownloadOptions) => {
        try {
            const window = BrowserWindow.fromWebContents(event.sender);
            if (!window) throw new Error('Window not found');

            const result = await downloader.download(url, options, (progress) => {
                // Check if window is still available before sending progress
                if (window && !window.isDestroyed()) {
                    // Normalize Unicode characters in filename for IPC transmission
                    const normalizedProgress = {
                        ...progress,
                        filename: progress.filename ? progress.filename.normalize('NFC') : progress.filename
                    };
                    window.webContents.send(IPC_CHANNELS.DOWNLOAD_PROGRESS, normalizedProgress);
                }
            });

            // Save to logs
            await fileManager.saveDownloadLog({
                url,
                result: 'success',
                date: new Date().toISOString(),
                folder: options.outputPath,
                filename: result.filename ? result.filename.normalize('NFC') : result.filename
            });

            return result;
        } catch (error: any) {
            // Save failed log
            await fileManager.saveDownloadLog({
                url,
                result: 'failed',
                date: new Date().toISOString(),
                folder: options.outputPath,
                error: error.message
            });

            throw error;
        }
    });

    ipcMain.handle(IPC_CHANNELS.DOWNLOAD_CANCEL, async () => {
        downloader.cancel();
    });

    // Settings handlers
    ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
        return configManager.getSettings();
    });

    ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_, settings: Partial<Settings>) => {
        return configManager.setSettings(settings);
    });

    ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, async () => {
        return configManager.resetSettings();
    });

    // File/Folder handlers
    ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_FOLDER, async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_PATH, async (_, path: string) => {
        return shell.openPath(path);
    });

    ipcMain.handle(IPC_CHANNELS.SHELL_SHOW_ITEM, async (_, path: string) => {
        return shell.showItemInFolder(path);
    });

    // Auth handlers
    ipcMain.handle(IPC_CHANNELS.AUTH_SAVE_COOKIE, async (_, domain: string, cookieContent: string) => {
        return authManager.saveCookie(domain, cookieContent);
    });

    ipcMain.handle(IPC_CHANNELS.AUTH_SAVE_CREDENTIALS, async (_, domain: string, username: string, password: string) => {
        return authManager.saveCredentials(domain, username, password);
    });

    ipcMain.handle(IPC_CHANNELS.AUTH_LIST, async () => {
        return authManager.listAuthEntries();
    });

    ipcMain.handle(IPC_CHANNELS.AUTH_DELETE, async (_, domain: string, type: 'cookie' | 'pass') => {
        return authManager.deleteAuth(domain, type);
    });

    ipcMain.handle(IPC_CHANNELS.AUTH_GET, async (_, domain: string) => {
        return authManager.getAuthForDomain(domain);
    });

    // Logs handlers
    ipcMain.handle(IPC_CHANNELS.LOGS_LOAD, async () => {
        return fileManager.loadLogs();
    });

    ipcMain.handle(IPC_CHANNELS.LOGS_CLEAR, async () => {
        return fileManager.clearLogs();
    });

    ipcMain.handle(IPC_CHANNELS.LOGS_OPEN_FOLDER, async () => {
        const logsPath = fileManager.getLogsPath();
        return shell.openPath(logsPath);
    });

    // Utility handlers
    ipcMain.handle(IPC_CHANNELS.CHECK_DEPENDENCIES, async () => {
        return downloader.checkDependencies();
    });

    ipcMain.handle(IPC_CHANNELS.GET_VERSION, async () => {
        const { app } = await import('electron');
        return app.getVersion();
    });

    // Window control handlers
    ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, async (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window?.minimize();
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, async (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window?.isMaximized()) {
            window.unmaximize();
        } else {
            window?.maximize();
        }
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, async (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window?.close();
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, async (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        return window?.isMaximized() || false;
    });
}