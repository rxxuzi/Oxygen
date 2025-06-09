export const IPC_CHANNELS = {
    // Download
    DOWNLOAD_START: 'download:start',
    DOWNLOAD_CANCEL: 'download:cancel',
    DOWNLOAD_PROGRESS: 'download:progress',

    // Settings
    SETTINGS_GET: 'settings:get',
    SETTINGS_SET: 'settings:set',
    SETTINGS_RESET: 'settings:reset',

    // File/Folder operations
    DIALOG_OPEN_FOLDER: 'dialog:open-folder',
    SHELL_OPEN_PATH: 'shell:open-path',
    SHELL_SHOW_ITEM: 'shell:show-item',

    // Auth
    AUTH_SAVE_COOKIE: 'auth:save-cookie',
    AUTH_SAVE_CREDENTIALS: 'auth:save-credentials',
    AUTH_LIST: 'auth:list',
    AUTH_DELETE: 'auth:delete',
    AUTH_GET: 'auth:get',

    // Logs
    LOGS_LOAD: 'logs:load',
    LOGS_CLEAR: 'logs:clear',
    LOGS_OPEN_FOLDER: 'logs:open-folder',

    // Utility
    CHECK_DEPENDENCIES: 'check-dependencies',
    GET_VERSION: 'get-version',
} as const;