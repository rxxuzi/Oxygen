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
    SHELL_OPEN_EXTERNAL: 'shell:open-external',

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

    // Library
    LIBRARY_SCAN: 'library:scan',
    LIBRARY_SCAN_DOWNLOAD_PATHS: 'library:scan-download-paths',
    LIBRARY_SCAN_FROM_LOGS: 'library:scan-from-logs',
    LIBRARY_GET_FILES: 'library:get-files',
    LIBRARY_ADD_FILE: 'library:add-file',
    LIBRARY_REMOVE_FILE: 'library:remove-file',
    LIBRARY_UPDATE_FILE: 'library:update-file',
    LIBRARY_MOVE_FILE: 'library:move-file',
    LIBRARY_DELETE_FILE: 'library:delete-file',
    LIBRARY_RENAME_FILE: 'library:rename-file',
    LIBRARY_GENERATE_THUMBNAIL: 'library:generate-thumbnail',
    LIBRARY_GET_FILE_STATS: 'library:get-file-stats',
    LIBRARY_COPY_PATH: 'library:copy-path',
    LIBRARY_CLEAN: 'library:clean',
    LIBRARY_RESET_PLAY_COUNTS: 'library:reset-play-counts',
    LIBRARY_RESET_FAVORITES: 'library:reset-favorites',
    LIBRARY_CLEAR: 'library:clear',
    LIBRARY_GET_STATS: 'library:get-stats',

    // Utility
    CHECK_DEPENDENCIES: 'check-dependencies',
    GET_VERSION: 'get-version',
    
    // Window control
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_CLOSE: 'window:close',
    WINDOW_IS_MAXIMIZED: 'window:is-maximized',
} as const;