declare global {
    interface Window {
        electron: {
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            send: (channel: string, ...args: any[]) => void;
            on: (channel: string, callback: (...args: any[]) => void) => () => void;
            once: (channel: string, callback: (...args: any[]) => void) => void;
            shell: {
                openPath: (path: string) => Promise<any>;
                showItemInFolder: (path: string) => Promise<any>;
            };
            dialog: {
                openFolder: () => Promise<string | null>;
            };
            window: {
                minimize: () => Promise<void>;
                maximize: () => Promise<void>;
                close: () => Promise<void>;
                isMaximized: () => Promise<boolean>;
            };
        };
    }
}

export {};