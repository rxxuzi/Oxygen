import {spawn} from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import util from 'util';
import {app} from 'electron';
import {DownloadOptions, DownloadProgress, DownloadResult} from '../shared/types';

export class Downloader {
    private readonly ytDlpPath: string;
    private readonly ffmpegPath: string;
    private currentProcess: any = null;

    constructor() {
        const platform = process.platform === 'win32' ? 'win32' :
            process.platform === 'darwin' ? 'darwin' : 'linux';

        const binariesPath = app.isPackaged
            ? path.join(process.resourcesPath, 'binaries')
            : path.join(__dirname, '../../resources/binaries', platform);

        this.ytDlpPath = path.join(binariesPath, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
        this.ffmpegPath = path.join(binariesPath, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
    }

    async download(
        url: string,
        options: DownloadOptions,
        progressCallback: (progress: DownloadProgress) => void
    ): Promise<DownloadResult> {
        // Try different strategies if YouTube bot detection occurs
        const strategies = [
            () => this.buildArgumentsWithoutCookies(url, options), // Start without cookies to avoid permission issues
            () => this.buildArgumentsSafeCookies(url, options), // Safe cookie approach with modern headers
            () => this.buildArgumentsWithFirefox(url, options), // Firefox user agent
            () => this.buildArgumentsWithAlternativeUA(url, options), // Mobile user agent
            () => this.buildArgumentsYouTubeSpecific(url, options), // YouTube-specific workarounds
            () => this.buildArgumentsBasic(url, options) // Basic approach as last resort
        ];

        for (let i = 0; i < strategies.length; i++) {
            try {
                const args = strategies[i]();
                
                // Create output directory if it doesn't exist
                await fs.mkdir(options.outputPath, { recursive: true });

                return await this.executeDownload(args, options, progressCallback);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                
                // Check for various error types that indicate we should try next strategy
                const shouldRetry = (
                    errorMessage.includes('Sign in to confirm') ||
                    errorMessage.includes('Could not copy Chrome cookie database') ||
                    errorMessage.includes('Permission denied') ||
                    errorMessage.includes('failed to load cookies') ||
                    errorMessage.includes('CookieLoadError')
                ) && i < strategies.length - 1;
                
                if (shouldRetry) {
                    console.log(`Strategy ${i + 1} failed (${this.getStrategyName(i)}), trying strategy ${i + 2}...`);
                    continue;
                }
                
                // If it's the last strategy or non-recoverable error, throw
                throw error;
            }
        }
        
        throw new Error('All download strategies failed');
    }

    private getStrategyName(index: number): string {
        const names = [
            'No Cookies',
            'Safe Cookies',
            'Firefox User-Agent', 
            'Mobile User-Agent',
            'YouTube Specific',
            'Basic'
        ];
        return names[index] || 'Unknown';
    }

    private async executeDownload(
        args: string[],
        options: DownloadOptions,
        progressCallback: (progress: DownloadProgress) => void
    ): Promise<DownloadResult> {
        return new Promise<DownloadResult>((resolve, reject) => {
            this.currentProcess = spawn(this.ytDlpPath, args, {
                env: { 
                    ...process.env, 
                    FFMPEG_PATH: this.ffmpegPath,
                    // Ensure UTF-8 encoding on Windows
                    PYTHONIOENCODING: 'utf-8',
                    LC_ALL: 'en_US.UTF-8'
                },
                stdio: ['ignore', 'pipe', 'pipe']
            });

                let stderr = '';
                let lastProgress: DownloadProgress = {
                    percent: 0,
                    downloadedBytes: 0,
                    totalBytes: 0,
                    speed: '0',
                    eta: 'Unknown',
                    filename: ''
                };

                this.currentProcess.stdout.on('data', (data: Buffer) => {
                    const output = data.toString('utf8');
                    const progress = this.parseProgress(output);

                    if (progress) {
                        lastProgress = { ...lastProgress, ...progress };
                        progressCallback(lastProgress);
                    }
                });

                this.currentProcess.stderr.on('data', (data: Buffer) => {
                    stderr += data.toString('utf8');
                });

                this.currentProcess.on('close', (code: number) => {
                    if (code === 0) {
                        resolve({
                            success: true,
                            filename: lastProgress.filename || 'Unknown',
                            outputPath: options.outputPath
                        });
                    } else {
                        reject(new Error(`Download failed with code ${code}: ${stderr}`));
                    }
                });

                this.currentProcess.on('error', (error: Error) => {
                    reject(error);
                });
            });
    }

    private buildArgumentsSafeCookies(url: string, options: DownloadOptions): string[] {
        const args = this.buildArgumentsBase(url, options);
        
        // Bot detection bypass with Chrome user agent
        args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        this.addHeaders(args);
        
        // Additional Chrome-like headers
        args.push('--add-header', 'Sec-Ch-Ua:"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"');
        args.push('--add-header', 'Sec-Ch-Ua-Mobile:?0');
        args.push('--add-header', 'Sec-Ch-Ua-Platform:"Windows"');
        
        this.addQualityAndFormat(args, options);
        this.addAdditionalOptionsWithoutCookies(args, options);
        args.push(url);
        
        return args;
    }

    private buildArgumentsBasic(url: string, options: DownloadOptions): string[] {
        const args = this.buildArgumentsBase(url, options);
        
        // Very basic approach - minimal options
        args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // Simple but effective format selection
        if (options.audioOnly) {
            args.push('-f', 'bestaudio/best');
        } else {
            if (options.videoFormat === 'mp4') {
                args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best');
                args.push('--merge-output-format', 'mp4');
                args.push('--postprocessor-args', 'ffmpeg:-c:v copy -c:a aac -avoid_negative_ts make_zero -movflags +faststart');
            } else {
                args.push('-f', 'bestvideo[height<=1080]+bestaudio/best');
                if (options.videoFormat !== 'auto') {
                    args.push('--merge-output-format', options.videoFormat);
                }
            }
        }
        
        // Only essential additional options
        if (options.cookieFile) {
            args.push('--cookies', options.cookieFile);
        }
        
        args.push(url);
        return args;
    }

    private parseProgress(output: string): Partial<DownloadProgress> | null {
        // Parse yt-dlp progress output
        const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%\s+of\s+~?\s*(\d+\.?\d*\w+)\s+at\s+(\d+\.?\d*\w+\/s)\s+ETA\s+(\d+:\d+)/);

        if (progressMatch) {
            return {
                percent: parseFloat(progressMatch[1]),
                totalBytes: this.parseSize(progressMatch[2]),
                speed: progressMatch[3],
                eta: progressMatch[4]
            };
        }

        // Parse filename - handle Unicode characters properly
        const filenameMatch = output.match(/\[download\] Destination: (.+)/);
        if (filenameMatch) {
            const fullPath = filenameMatch[1].trim();
            // Normalize Unicode characters and extract basename
            const filename = path.basename(fullPath).normalize('NFC');
            return {
                filename: filename
            };
        }

        return null;
    }

    private parseSize(sizeStr: string): number {
        const match = sizeStr.match(/(\d+\.?\d*)\s*(\w+)/);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();

        const units: Record<string, number> = {
            'B': 1,
            'KB': 1024,
            'KIB': 1024,
            'MB': 1024 * 1024,
            'MIB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024,
            'GIB': 1024 * 1024 * 1024
        };

        return value * (units[unit] || 1);
    }

    private buildArgumentsWithFirefox(url: string, options: DownloadOptions): string[] {
        const args = this.buildArgumentsBase(url, options);
        
        // Bot detection bypass with Firefox user agent
        args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0');
        this.addHeaders(args);
        
        // Firefox-specific headers (but no browser cookies)
        args.push('--add-header', 'Sec-Fetch-Dest:document');
        args.push('--add-header', 'Sec-Fetch-Mode:navigate');
        args.push('--add-header', 'Sec-Fetch-Site:none');
        args.push('--add-header', 'Sec-Fetch-User:?1');
        
        this.addQualityAndFormat(args, options);
        this.addAdditionalOptionsWithoutCookies(args, options);
        args.push(url);
        
        return args;
    }

    private buildArgumentsWithoutCookies(url: string, options: DownloadOptions): string[] {
        const args = this.buildArgumentsBase(url, options);
        
        // Bot detection bypass without cookies - use different OS signature
        args.push('--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        this.addHeaders(args);
        
        // Add some additional bypass options to avoid rate limiting
        args.push('--sleep-interval', '1');
        args.push('--max-sleep-interval', '3');
        
        // For YouTube, try to use a different approach
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Add some YouTube-specific headers
            args.push('--add-header', 'Sec-Ch-Ua:"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"');
            args.push('--add-header', 'Sec-Ch-Ua-Mobile:?0');
            args.push('--add-header', 'Sec-Ch-Ua-Platform:"Linux"');
            args.push('--add-header', 'Sec-Fetch-Dest:document');
            args.push('--add-header', 'Sec-Fetch-Mode:navigate');
            args.push('--add-header', 'Sec-Fetch-Site:none');
            args.push('--add-header', 'Sec-Fetch-User:?1');
        }
        
        this.addQualityAndFormat(args, options);
        this.addAdditionalOptionsWithoutCookies(args, options);
        args.push(url);
        
        return args;
    }

    private buildArgumentsWithAlternativeUA(url: string, options: DownloadOptions): string[] {
        const args = this.buildArgumentsBase(url, options);
        
        // Bot detection bypass with mobile user agent
        args.push('--user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');
        
        // Mobile-specific headers
        args.push('--add-header', 'Accept-Language:en-US,en;q=0.9');
        args.push('--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
        args.push('--add-header', 'Accept-Encoding:gzip, deflate, br');
        
        // Only try edge cookies if manual cookies aren't available
        if ((url.includes('youtube.com') || url.includes('youtu.be')) && !options.cookieFile) {
            // Don't use browser cookies to avoid permission issues
        }
        
        this.addQualityAndFormat(args, options);
        this.addAdditionalOptionsWithoutCookies(args, options);
        args.push(url);
        
        return args;
    }

    private buildArgumentsYouTubeSpecific(url: string, options: DownloadOptions): string[] {
        const args = this.buildArgumentsBase(url, options);
        
        // YouTube-specific bypass approach
        args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Minimal headers for YouTube
        args.push('--add-header', 'Accept-Language:en-US,en;q=0.5');
        args.push('--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
        
        // YouTube-specific options
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Use older extractor approach
            args.push('--extractor-args', 'youtube:player_client=android');
            args.push('--sleep-interval', '2');
            args.push('--max-sleep-interval', '5');
        }
        
        // Format selection with audio preservation
        if (options.audioOnly) {
            if (options.audioFormat === 'auto') {
                args.push('-f', 'bestaudio/best');
            } else {
                args.push('-f', `bestaudio[ext=${options.audioFormat}]/bestaudio/best`);
                args.push('-x');
                args.push('--audio-format', options.audioFormat);
                args.push('--audio-quality', '0');
            }
        } else {
            if (options.videoFormat === 'auto') {
                args.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]');
            } else if (options.videoFormat === 'mp4') {
                args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best');
                args.push('--merge-output-format', 'mp4');
                args.push('--prefer-ffmpeg');
                args.push('--postprocessor-args', 'ffmpeg:-c:v copy -c:a aac -avoid_negative_ts make_zero -movflags +faststart');
            } else {
                args.push('-f', `bestvideo[height<=720]+bestaudio/best[height<=720]`);
                args.push('--merge-output-format', options.videoFormat);
                args.push('--prefer-ffmpeg');
            }
        }
        
        // Only essential options
        if (options.cookieFile) {
            args.push('--cookies', options.cookieFile);
        }
        
        args.push(url);
        return args;
    }

    private buildArgumentsBase(url: string, options: DownloadOptions): string[] {
        const args: string[] = [];

        // Basic options
        args.push('--no-playlist');
        args.push('--progress');
        args.push('--newline');
        // Remove --update to prevent cookie loading on startup
        
        // Unicode and encoding options for proper filename handling
        args.push('--encoding', 'UTF-8');
        
        // Explicitly disable browser cookie extraction to prevent permission issues
        args.push('--no-cookies-from-browser');
        
        // Output path and filename - use restrictfilenames for better Unicode support
        const outputTemplate = path.join(options.outputPath, '%(title)s.%(ext)s');
        args.push('-o', outputTemplate);
        
        return args;
    }

    private addHeaders(args: string[]): void {
        args.push('--add-header', 'Accept-Language:en-US,en;q=0.9');
        args.push('--add-header', 'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        args.push('--add-header', 'Accept-Encoding:gzip, deflate, br');
        args.push('--add-header', 'DNT:1');
        args.push('--add-header', 'Connection:keep-alive');
        args.push('--add-header', 'Upgrade-Insecure-Requests:1');
    }

    private addQualityAndFormat(args: string[], options: DownloadOptions): void {
        // Quality and format
        if (options.audioOnly) {
            if (options.audioFormat === 'auto') {
                args.push('-f', 'bestaudio/best');
            } else {
                args.push('-f', `bestaudio[ext=${options.audioFormat}]/bestaudio/best`);
                args.push('-x'); // Extract audio
                args.push('--audio-format', options.audioFormat);
                args.push('--audio-quality', '0'); // Best quality
            }
        } else {
            const qualityMap: Record<string, string> = {
                'best': '',
                'high': '[height<=1080]',
                'medium': '[height<=720]',
                'low': '[height<=480]',
                'worst': 'worst'
            };

            const qualityFilter = qualityMap[options.quality] || '';

            if (options.videoFormat === 'auto') {
                args.push('-f', `bestvideo${qualityFilter}+bestaudio/best`);
            } else {
                // Improved format selection for specific video formats
                this.addVideoFormatSelection(args, options.videoFormat, qualityFilter);
            }
        }
    }

    private addVideoFormatSelection(args: string[], videoFormat: string, qualityFilter: string): void {
        // Simplified, reliable format selection
        switch (videoFormat) {
            case 'mp4':
                // Simple, reliable MP4 selection - avoid complex fallbacks
                if (qualityFilter) {
                    args.push('-f', `bestvideo[ext=mp4]${qualityFilter}+bestaudio[ext=m4a]/bestvideo${qualityFilter}+bestaudio/best`);
                } else {
                    // For "best" quality, get the absolute best available
                    args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best');
                }
                args.push('--merge-output-format', 'mp4');
                args.push('--postprocessor-args', 'ffmpeg:-c:v copy -c:a aac -avoid_negative_ts make_zero -movflags +faststart');
                break;
                
            case 'mov':
                if (qualityFilter) {
                    args.push('-f', `bestvideo[ext=mp4]${qualityFilter}+bestaudio[ext=m4a]/bestvideo${qualityFilter}+bestaudio/best`);
                } else {
                    args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best');
                }
                args.push('--merge-output-format', 'mov');
                args.push('--postprocessor-args', 'ffmpeg:-c:v copy -c:a aac -avoid_negative_ts make_zero -movflags +faststart');
                break;
                
            case 'webm':
                if (qualityFilter) {
                    args.push('-f', `bestvideo[ext=webm]${qualityFilter}+bestaudio[ext=webm]/bestvideo${qualityFilter}+bestaudio/best`);
                } else {
                    args.push('-f', 'bestvideo[ext=webm]+bestaudio[ext=webm]/bestvideo+bestaudio/best');
                }
                args.push('--merge-output-format', 'webm');
                break;
                
            default:
                if (qualityFilter) {
                    args.push('-f', `bestvideo${qualityFilter}+bestaudio/best`);
                } else {
                    args.push('-f', 'bestvideo+bestaudio/best');
                }
                args.push('--merge-output-format', videoFormat);
                break;
        }
        
        args.push('--prefer-ffmpeg');
    }

    private addAdditionalOptions(args: string[], options: DownloadOptions): void {
        // Additional options
        if (options.proxy) {
            args.push('--proxy', options.proxy);
        }

        if (options.subtitles) {
            args.push('--write-subs');
            args.push('--sub-langs', options.subtitles);
        }

        if (options.thumbnail) {
            args.push('--write-thumbnail');
            if (options.embedThumbnail) {
                args.push('--embed-thumbnail');
            }
        }

        if (options.cookieFile) {
            args.push('--cookies', options.cookieFile);
        }

        if (options.username && options.password) {
            args.push('-u', options.username);
            args.push('-p', options.password);
        }

        // Performance options
        args.push('--concurrent-fragments', options.segments?.toString() || '4');
        args.push('--retries', options.retries?.toString() || '5');
        args.push('--buffer-size', options.bufferSize || '16K');
    }

    private addAdditionalOptionsWithoutCookies(args: string[], options: DownloadOptions): void {
        // Additional options without cookie handling
        if (options.proxy) {
            args.push('--proxy', options.proxy);
        }

        if (options.subtitles) {
            args.push('--write-subs');
            args.push('--sub-langs', options.subtitles);
        }

        if (options.thumbnail) {
            args.push('--write-thumbnail');
            if (options.embedThumbnail) {
                args.push('--embed-thumbnail');
            }
        }

        // Only use manual cookies if provided, never try to extract from browser
        if (options.cookieFile) {
            args.push('--cookies', options.cookieFile);
        }

        if (options.username && options.password) {
            args.push('-u', options.username);
            args.push('-p', options.password);
        }

        // More conservative performance options
        args.push('--concurrent-fragments', Math.min(options.segments || 4, 2).toString());
        args.push('--retries', options.retries?.toString() || '3');
        args.push('--buffer-size', options.bufferSize || '8K');
    }

    cancel(): void {
        if (this.currentProcess) {
            this.currentProcess.kill('SIGTERM');
            this.currentProcess = null;
        }
    }

    async checkDependencies(): Promise<{ ytdlp: boolean; ffmpeg: boolean }> {
        try {
            await fs.access(this.ytDlpPath);
            await fs.access(this.ffmpegPath);
            return { ytdlp: true, ffmpeg: true };
        } catch {
            return { ytdlp: false, ffmpeg: false };
        }
    }
}