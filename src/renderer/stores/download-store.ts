import { create } from 'zustand';
import { DownloadOptions, DownloadProgress, DownloadResult } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

interface DownloadStore {
    isDownloading: boolean;
    progress: DownloadProgress | null;
    logs: string[];
    currentUrl: string | null;

    startDownload: (url: string, options: DownloadOptions) => Promise<void>;
    cancelDownload: () => Promise<void>;
    updateProgress: (progress: DownloadProgress) => void;
    addLog: (message: string) => void;
    clearLogs: () => void;
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
    isDownloading: false,
    progress: null,
    logs: [],
    currentUrl: null,

    startDownload: async (url: string, options: DownloadOptions) => {
        try {
            set({ isDownloading: true, currentUrl: url, progress: null });
            get().addLog(`Starting download: ${url}`);

            // Set up progress listener
            const removeListener = window.electron.on(IPC_CHANNELS.DOWNLOAD_PROGRESS, (progress: DownloadProgress) => {
                get().updateProgress(progress);
            });

            const result: DownloadResult = await window.electron.invoke(IPC_CHANNELS.DOWNLOAD_START, url, options);

            removeListener();

            if (result.success) {
                get().addLog(`Download completed: ${result.filename}`);
            } else {
                get().addLog(`Download failed: ${result.error}`);
            }

            set({ isDownloading: false, currentUrl: null, progress: null });
        } catch (error: any) {
            get().addLog(`Download error: ${error.message}`);
            set({ isDownloading: false, currentUrl: null, progress: null });
        }
    },

    cancelDownload: async () => {
        try {
            await window.electron.invoke(IPC_CHANNELS.DOWNLOAD_CANCEL);
            get().addLog('Download cancelled');
            set({ isDownloading: false, currentUrl: null, progress: null });
        } catch (error: any) {
            get().addLog(`Cancel error: ${error.message}`);
        }
    },

    updateProgress: (progress: DownloadProgress) => {
        set({ progress });

        // Add progress log
        const filename = progress.filename ? ` ${progress.filename}` : '';
        get().addLog(`Progress${filename}: ${progress.percent.toFixed(1)}% at ${progress.speed}`);
    },

    addLog: (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        set((state) => ({
            logs: [...state.logs, `[${timestamp}] ${message}`].slice(-100) // Keep last 100 logs
        }));
    },

    clearLogs: () => {
        set({ logs: [] });
    }
}));