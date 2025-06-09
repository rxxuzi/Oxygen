import Store from 'electron-store';
import path from 'path';
import os from 'os';
import { Settings } from '../shared/types';

export class ConfigManager {
    private store: Store;
    private defaultSettings: Settings;

    constructor(store: Store) {
        this.store = store;
        this.defaultSettings = this.getDefaultSettings();
        this.initializeSettings();
    }

    private getDefaultSettings(): Settings {
        const homeDir = os.homedir();
        const platform = process.platform;

        let videoPath: string;
        let audioPath: string;

        if (platform === 'win32') {
            videoPath = path.join(homeDir, 'Videos', 'oxygen');
            audioPath = path.join(homeDir, 'Music', 'oxygen');
        } else if (platform === 'darwin') {
            videoPath = path.join(homeDir, 'Movies', 'oxygen');
            audioPath = path.join(homeDir, 'Music', 'oxygen');
        } else {
            videoPath = path.join(homeDir, 'Videos', 'oxygen');
            audioPath = path.join(homeDir, 'Music', 'oxygen');
        }

        return {
            // Video settings
            videoQuality: 'best',
            videoFormat: 'auto',
            videoOutputPath: videoPath,

            // Audio settings
            audioFormat: 'auto',
            audioOutputPath: audioPath,

            // Download settings
            segments: 4,
            retries: 5,
            bufferSize: '16M',

            // Other settings
            proxy: '',
            subtitles: '',
            writeThumbnail: false,
            embedThumbnail: false,

            // App settings
            theme: 'dark',
            autoUpdate: true,
            minimizeToTray: false,
        };
    }

    private initializeSettings(): void {
        const currentSettings = this.store.get('settings', {}) as Partial<Settings>;
        const mergedSettings = { ...this.defaultSettings, ...currentSettings };
        this.store.set('settings', mergedSettings);
    }

    getSettings(): Settings {
        return this.store.get('settings', this.defaultSettings) as Settings;
    }

    setSettings(updates: Partial<Settings>): Settings {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...updates };
        this.store.set('settings', newSettings);
        return newSettings;
    }

    resetSettings(): Settings {
        this.store.set('settings', this.defaultSettings);
        return this.defaultSettings;
    }

    getConfigPath(): string {
        return this.store.path;
    }
}