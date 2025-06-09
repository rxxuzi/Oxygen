import { create } from 'zustand';
import { LogEntry } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

interface LogsStore {
    logs: LogEntry[];
    loadLogs: () => Promise<void>;
    clearLogs: () => Promise<void>;
    openLogsFolder: () => Promise<void>;
}

export const useLogsStore = create<LogsStore>((set) => ({
    logs: [],

    loadLogs: async () => {
        try {
            const logs = await window.electron.invoke(IPC_CHANNELS.LOGS_LOAD);
            set({ logs });
        } catch (error) {
            console.error('Failed to load logs:', error);
        }
    },

    clearLogs: async () => {
        try {
            await window.electron.invoke(IPC_CHANNELS.LOGS_CLEAR);
            set({ logs: [] });
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    },

    openLogsFolder: async () => {
        try {
            await window.electron.invoke(IPC_CHANNELS.LOGS_OPEN_FOLDER);
        } catch (error) {
            console.error('Failed to open logs folder:', error);
        }
    },
}));