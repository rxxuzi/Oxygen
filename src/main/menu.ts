import { Menu, MenuItemConstructorOptions, BrowserWindow, shell, app } from 'electron';

export function setupMenu(mainWindow: BrowserWindow): void {
    const isMac = process.platform === 'darwin';

    const template: MenuItemConstructorOptions[] = [
        // App Menu (macOS only)
        ...(isMac ? [{
            label: app.getName(),
            submenu: [
                { role: 'about' as const },
                { type: 'separator' as const },
                { role: 'services' as const },
                { type: 'separator' as const },
                { role: 'hide' as const },
                { role: 'hideOthers' as const },
                { role: 'unhide' as const },
                { type: 'separator' as const },
                { role: 'quit' as const }
            ]
        }] : []),

        // File Menu
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Download',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu:new-download');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Open Downloads Folder',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.send('menu:open-downloads');
                    }
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },

        // Edit Menu
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' as const },
                    { role: 'delete' as const },
                    { role: 'selectAll' as const }
                ] : [
                    { role: 'delete' as const },
                    { type: 'separator' as const },
                    { role: 'selectAll' as const }
                ])
            ]
        },

        // View Menu
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },

        // Window Menu
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' },
                ...(isMac ? [
                    { type: 'separator' as const },
                    { role: 'front' as const }
                ] : [])
            ]
        },

        // Help Menu
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        await shell.openExternal('https://github.com/rxxuzi/oxygen');
                    }
                },
                {
                    label: 'Report Issue',
                    click: async () => {
                        await shell.openExternal('https://github.com/rxxuzi/oxygen/issues');
                    }
                },
                { type: 'separator' },
                {
                    label: 'View Logs',
                    click: () => {
                        mainWindow.webContents.send('menu:view-logs');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}