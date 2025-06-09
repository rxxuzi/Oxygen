import { create } from 'zustand';
import { Settings } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

interface SettingsStore {
    settings: Settings;
    loadSettings: () => Promise<void>;
    updateSettings: (updates: Partial<Settings>) => Promise<void>;
    resetSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
    videoQuality: 'best',
    videoFormat: 'auto',
    videoOutputPath: '',
    audioFormat: 'auto',
    audioOutputPath: '',
    segments: 4,
    retries: 5,
    bufferSize: '16M',
    proxy: '',
    subtitles: '',
    writeThumbnail: false,
    embedThumbnail: false,
    theme: 'dark',
    autoUpdate: true,
    minimizeToTray: false,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
    settings: defaultSettings,

    loadSettings: async () => {
        try {
            const settings = await window.electron.invoke(IPC_CHANNELS.SETTINGS_GET);
            set({ settings });
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    },

    updateSettings: async (updates: Partial<Settings>) => {
        try {
            const newSettings = await window.electron.invoke(IPC_CHANNELS.SETTINGS_SET, updates);
            set({ settings: newSettings });
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    },

    resetSettings: async () => {
        try {
            const settings = await window.electron.invoke(IPC_CHANNELS.SETTINGS_RESET);
            set({ settings });
        } catch (error) {
            console.error('Failed to reset settings:', error);
        }
    },
}));