import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import { Downloader } from './downloader';
import { ConfigManager } from './config';
import { AuthManager } from './auth-manager';
import { FileManager } from './file-manager';
import { LibraryManager } from './library-manager';
import { DownloadOptions, Settings } from '../shared/types';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import path from 'path';

export function setupIpcHandlers(configManager: ConfigManager, authManager: AuthManager) {
    const downloader = new Downloader();
    const fileManager = new FileManager();
    const libraryManager = new LibraryManager();

    // Download handlers
    ipcMain.handle(IPC_CHANNELS.DOWNLOAD_START, async (event, url: string, options: DownloadOptions) => {
        try {
            const window = BrowserWindow.fromWebContents(event.sender);
            if (!window) throw new Error('Window not found');

            const mode = options.powerMode ? 'Power Mode' : 'Normal';
            const format = options.audioOnly ? `audio(${options.audioFormat})` : `video(${options.videoFormat})`;
            console.warn(`[Download] ${mode} | ${format} | ${url}`);

            const download = options.powerMode
                ? downloader.downloadWithPowerMode.bind(downloader)
                : downloader.download.bind(downloader);

            const result = await download(url, options, (progress) => {
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

            // Auto-add to library if file was downloaded successfully
            if (result.filename && result.outputPath) {
                const filePath = path.join(result.outputPath, result.filename);
                try {
                    await libraryManager.addFile(filePath);
                } catch (error) {
                    console.log('Failed to auto-add file to library:', error);
                    // Don't fail the download if library add fails
                }
            }

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

    ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_, path: string) => {
        return shell.openPath(path);
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

    // Library handlers
    ipcMain.handle(IPC_CHANNELS.LIBRARY_SCAN, async (_, directoryPath: string) => {
        return libraryManager.scanDirectory(directoryPath);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_SCAN_DOWNLOAD_PATHS, async (_, downloadPaths: string[]) => {
        return libraryManager.scanDownloadPaths(downloadPaths);
    });


    ipcMain.handle(IPC_CHANNELS.LIBRARY_GET_FILES, async () => {
        return libraryManager.getFiles();
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_CLEAN, async () => {
        return libraryManager.cleanLibrary();
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_RESET_PLAY_COUNTS, async () => {
        return libraryManager.resetPlayCounts();
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_RESET_FAVORITES, async () => {
        return libraryManager.resetFavorites();
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_CLEAR, async () => {
        return libraryManager.clearLibrary();
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_GET_STATS, async () => {
        return libraryManager.getLibraryStats();
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_ADD_FILE, async (_, filePath: string) => {
        return libraryManager.addFile(filePath);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_REMOVE_FILE, async (_, fileId: string) => {
        return libraryManager.removeFile(fileId);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_UPDATE_FILE, async (_, fileId: string, updates: any) => {
        return libraryManager.updateFile(fileId, updates);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_MOVE_FILE, async (_, fileId: string, newPath: string) => {
        return libraryManager.moveFile(fileId, newPath);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_DELETE_FILE, async (_, fileId: string) => {
        return libraryManager.deleteFile(fileId);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_RENAME_FILE, async (_, fileId: string, newName: string) => {
        return libraryManager.renameFile(fileId, newName);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_GENERATE_THUMBNAIL, async (_, fileId: string) => {
        return libraryManager.generateThumbnail(fileId);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_GET_FILE_STATS, async (_, filePath: string) => {
        return libraryManager.getFileStats(filePath);
    });

    ipcMain.handle(IPC_CHANNELS.LIBRARY_COPY_PATH, async (_, fileId: string) => {
        return libraryManager.copyPath(fileId);
    });
}