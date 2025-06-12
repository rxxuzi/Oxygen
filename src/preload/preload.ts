import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';

console.log('Preload script starting...');
console.log('IPC_CHANNELS:', IPC_CHANNELS);

// Type helper for IPC channels
type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];

// Define the API that will be exposed to the renderer
const electronAPI = {
    // Invoke methods (request-response)
    invoke: (channel: string, ...args: any[]) => {
        const validChannels = Object.values(IPC_CHANNELS) as string[];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Invalid channel: ${channel}`);
    },

    // Send methods (one-way)
    send: (channel: string, ...args: any[]) => {
        const validChannels = Object.values(IPC_CHANNELS) as string[];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    },

    // On methods (listen for events)
    on: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels = Object.values(IPC_CHANNELS) as string[];
        if (validChannels.includes(channel)) {
            const subscription = (_event: IpcRendererEvent, ...args: any[]) => callback(...args);
            ipcRenderer.on(channel, subscription);

            // Return a function to remove the listener
            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        }
        throw new Error(`Invalid channel: ${channel}`);
    },

    // Once methods (listen for one event)
    once: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels = Object.values(IPC_CHANNELS) as string[];
        if (validChannels.includes(channel)) {
            ipcRenderer.once(channel, (_event, ...args) => callback(...args));
        }
    },

    // Shell API
    shell: {
        openPath: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_PATH, path),
        showItemInFolder: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.SHELL_SHOW_ITEM, path),
    },

    // Dialog API
    dialog: {
        openFolder: () => ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FOLDER),
    },

    // Window control API
    window: {
        minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
        maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
        close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
        isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
    },
};

// Expose the API to the renderer process
console.log('Exposing electronAPI to main world...');
contextBridge.exposeInMainWorld('electron', electronAPI);
console.log('Preload script completed successfully');

// Type definitions for TypeScript
export type ElectronAPI = typeof electronAPI;