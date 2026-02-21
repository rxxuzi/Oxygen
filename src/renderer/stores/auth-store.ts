import { create } from 'zustand';
import { AuthEntry, AuthData } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

interface AuthStore {
    authEntries: AuthEntry[];
    loadAuthEntries: () => Promise<void>;
    saveCookie: (url: string, content: string) => Promise<boolean>;
    saveCredentials: (url: string, username: string, password: string) => Promise<boolean>;
    deleteAuth: (domain: string, type: 'cookie' | 'pass') => Promise<boolean>;
    getAuthForUrl: (url: string) => Promise<AuthData>;
}

export const useAuthStore = create<AuthStore>((set, _get) => ({
    authEntries: [],

    loadAuthEntries: async () => {
        try {
            const entries = await window.electron.invoke(IPC_CHANNELS.AUTH_LIST);
            set({ authEntries: entries });
        } catch (error) {
            console.error('Failed to load auth entries:', error);
        }
    },

    saveCookie: async (url: string, content: string) => {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            const success = await window.electron.invoke(IPC_CHANNELS.AUTH_SAVE_COOKIE, domain, content);
            return success;
        } catch (error) {
            console.error('Failed to save cookie:', error);
            return false;
        }
    },

    saveCredentials: async (url: string, username: string, password: string) => {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            const success = await window.electron.invoke(IPC_CHANNELS.AUTH_SAVE_CREDENTIALS, domain, username, password);
            return success;
        } catch (error) {
            console.error('Failed to save credentials:', error);
            return false;
        }
    },

    deleteAuth: async (domain: string, type: 'cookie' | 'pass') => {
        try {
            const success = await window.electron.invoke(IPC_CHANNELS.AUTH_DELETE, domain, type);
            return success;
        } catch (error) {
            console.error('Failed to delete auth:', error);
            return false;
        }
    },

    getAuthForUrl: async (url: string) => {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            const authData = await window.electron.invoke(IPC_CHANNELS.AUTH_GET, domain);
            return authData;
        } catch (error) {
            console.error('Failed to get auth:', error);
            return {};
        }
    },
}));