// Video and Audio formats
export type VideoFormat = 'auto' | 'mp4' | 'mov' | 'webm' | 'avi' | 'mkv';
export type AudioFormat = 'auto' | 'mp3' | 'wav' | 'aac' | 'flac' | 'opus';
export type Quality = 'best' | 'high' | 'medium' | 'low' | 'worst';

// Download options
export interface DownloadOptions {
    outputPath: string;
    audioOnly: boolean;
    quality: Quality;
    videoFormat: VideoFormat;
    audioFormat: AudioFormat;
    proxy?: string;
    subtitles?: string;
    thumbnail?: boolean;
    embedThumbnail?: boolean;
    cookieFile?: string;
    username?: string;
    password?: string;
    segments?: number;
    retries?: number;
    bufferSize?: string;
}

// Download progress
export interface DownloadProgress {
    percent: number;
    downloadedBytes: number;
    totalBytes: number;
    speed: string;
    eta: string;
    filename: string;
}

// Download result
export interface DownloadResult {
    success: boolean;
    filename?: string;
    outputPath?: string;
    error?: string;
}

// Settings
export interface Settings {
    // Video settings
    videoQuality: Quality;
    videoFormat: VideoFormat;
    videoOutputPath: string;

    // Audio settings
    audioFormat: AudioFormat;
    audioOutputPath: string;

    // Download settings
    segments: number;
    retries: number;
    bufferSize: string;

    // Other settings
    proxy: string;
    subtitles: string;
    writeThumbnail: boolean;
    embedThumbnail: boolean;

    // App settings
    theme: 'light' | 'dark' | 'auto';
    autoUpdate: boolean;
    minimizeToTray: boolean;
}

// Auth
export interface AuthEntry {
    domain: string;
    type: 'cookie' | 'pass';
    status: 'success' | 'failed';
    path?: string;
    createdAt: string;
}

export interface AuthData {
    cookieFile?: string;
    username?: string;
    password?: string;
}

// Logs
export interface LogEntry {
    url: string;
    result: 'success' | 'failed';
    date: string;
    folder: string;
    filename?: string;
    error?: string;
}

// Queue
export interface QueueItem {
    id: string;
    url: string;
    options: DownloadOptions;
    status: 'pending' | 'downloading' | 'completed' | 'failed';
    progress?: DownloadProgress;
    error?: string;
    addedAt: string;
    completedAt?: string;
}