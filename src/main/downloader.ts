import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';
import { DownloadOptions, DownloadProgress, DownloadResult, VideoFormat, AudioFormat } from '../shared/types';

export class Downloader {
    private ytDlpPath: string;
    private ffmpegPath: string;
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
        try {
            // Build yt-dlp arguments
            const args = this.buildArguments(url, options);

            // Create output directory if it doesn't exist
            await fs.mkdir(options.outputPath, { recursive: true });

            return new Promise((resolve, reject) => {
                this.currentProcess = spawn(this.ytDlpPath, args, {
                    env: { ...process.env, FFMPEG_PATH: this.ffmpegPath },
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
        } catch (error) {
            throw error;
        }
    }

    private buildArguments(url: string, options: DownloadOptions): string[] {
        const args: string[] = [];

        // Basic options
        args.push('--no-playlist');
        args.push('--progress');
        args.push('--newline');
        args.push('--update'); // Auto-update yt-dlp

        // Output path and filename
        const outputTemplate = path.join(options.outputPath, '%(title)s.%(ext)s');
        args.push('-o', outputTemplate);

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
                args.push('-f', `bestvideo${qualityFilter}[ext=${options.videoFormat}]+bestaudio/best[ext=${options.videoFormat}]/best`);
                args.push('--merge-output-format', options.videoFormat);
            }
        }

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

        // Add URL
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

        // Parse filename
        const filenameMatch = output.match(/\[download\] Destination: (.+)/);
        if (filenameMatch) {
            return {
                filename: path.basename(filenameMatch[1])
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