// URL utilities
export function getDomainFromUrl(url: string): string {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return '';
    }
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// File size utilities
export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function parseSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?)B?$/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    const units: Record<string, number> = {
        '': 1,
        'K': 1024,
        'M': 1024 * 1024,
        'G': 1024 * 1024 * 1024,
        'T': 1024 * 1024 * 1024 * 1024,
    };

    return value * (units[unit] || 1);
}

// Time utilities
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function parseETA(etaStr: string): number {
    const match = etaStr.match(/(\d+):(\d+)(?::(\d+))?/);
    if (!match) return 0;

    const hours = match[3] ? parseInt(match[1]) : 0;
    const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
    const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);

    return hours * 3600 + minutes * 60 + seconds;
}

// Validation utilities
export function validateBufferSize(size: string): boolean {
    return /^\d+[KMGT]?$/i.test(size);
}

export function validateProxy(proxy: string): boolean {
    if (!proxy) return true; // Empty proxy is valid

    try {
        const url = new URL(proxy);
        return ['http:', 'https:', 'socks5:'].includes(url.protocol);
    } catch {
        return false;
    }
}

// Platform utilities
export function getPlatform(): 'windows' | 'mac' | 'linux' {
    const platform = process.platform;
    if (platform === 'win32') return 'windows';
    if (platform === 'darwin') return 'mac';
    return 'linux';
}

export function getExecutableExtension(): string {
    return process.platform === 'win32' ? '.exe' : '';
}