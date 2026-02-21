// src/main/stream-interceptor.ts
import { BrowserWindow } from 'electron';

export interface InterceptedStream {
    url: string;
    type: 'm3u8' | 'ts' | 'mpd';
    headers: Record<string, string>;
    referer: string;
    timestamp: number;
}

export class StreamInterceptor {
    private window: BrowserWindow | null = null;
    private streams: InterceptedStream[] = [];
    private pageTitle: string = '';
    private pageUrl: string = '';

    async openAndIntercept(
        targetUrl: string,
        onFound: (stream: InterceptedStream) => void,
        timeoutMs: number = 120000
    ): Promise<void> {
        this.streams = [];
        this.pageTitle = '';
        this.pageUrl = targetUrl;

        this.log(`Opening: ${targetUrl}`);

        const partition = `power-mode-${Date.now()}`;

        this.window = new BrowserWindow({
            width: 1280,
            height: 720,
            show: true,
            title: `[Power Mode] ${targetUrl}`,
            webPreferences: {
                sandbox: false,
                contextIsolation: true,
                partition,
            },
        });

        let foundStream = false;

        const streamPromise = new Promise<void>((resolve) => {
            // Monitor requests by URL pattern
            this.window!.webContents.session.webRequest.onBeforeSendHeaders(
                { urls: ['*://*/*'] },
                (details, callback) => {
                    const url = details.url;

                    if (this.isStreamUrl(url)) {
                        const stream: InterceptedStream = {
                            url,
                            type: this.getStreamType(url),
                            headers: details.requestHeaders as Record<string, string>,
                            referer: this.pageUrl,
                            timestamp: Date.now(),
                        };

                        this.streams.push(stream);
                        this.log(`Stream found [${stream.type}]: ${url.substring(0, 150)}`);
                        onFound(stream);

                        if (stream.type === 'm3u8' && !foundStream) {
                            foundStream = true;
                            resolve();
                        }
                    }

                    callback({ requestHeaders: details.requestHeaders });
                }
            );

            // Also monitor responses by content-type
            this.window!.webContents.session.webRequest.onHeadersReceived(
                { urls: ['*://*/*'] },
                (details, callback) => {
                    const contentType =
                        details.responseHeaders?.['content-type']?.[0] ||
                        details.responseHeaders?.['Content-Type']?.[0] ||
                        '';

                    if (
                        contentType.includes('mpegurl') ||
                        contentType.includes('x-mpegURL') ||
                        contentType.includes('apple.mpegurl')
                    ) {
                        const alreadyFound = this.streams.some((s) => s.url === details.url);
                        if (!alreadyFound) {
                            const stream: InterceptedStream = {
                                url: details.url,
                                type: 'm3u8',
                                headers: {},
                                referer: this.pageUrl,
                                timestamp: Date.now(),
                            };
                            this.streams.push(stream);
                            this.log(`Stream found [content-type]: ${details.url.substring(0, 150)}`);
                            onFound(stream);

                            if (!foundStream) {
                                foundStream = true;
                                resolve();
                            }
                        }
                    }

                    callback({ responseHeaders: details.responseHeaders });
                }
            );

            // User closed the window manually = cancel
            this.window!.on('closed', () => {
                this.window = null;
                if (!foundStream) {
                    this.log('Window closed by user');
                    resolve();
                }
            });

            // Timeout
            setTimeout(() => {
                if (!foundStream) {
                    this.log(`Timeout after ${timeoutMs / 1000}s`);
                }
                resolve();
            }, timeoutMs);
        });

        await this.window.loadURL(targetUrl);
        this.pageTitle = this.window.webContents.getTitle() || '';
        this.log(`Page loaded, waiting for user to play video...`);

        // Wait for m3u8 or timeout or window close
        await streamPromise;

        // Grab final title
        if (this.window && !this.window.isDestroyed()) {
            this.pageTitle = this.window.webContents.getTitle() || this.pageTitle;
        }

        const count = this.streams.filter((s) => s.type === 'm3u8').length;
        this.log(`Done: ${count} m3u8 stream(s) captured`);

        // Close browser immediately
        if (count > 0) {
            this.destroy();
        }
    }

    private isStreamUrl(url: string): boolean {
        return (
            url.includes('.m3u8') ||
            url.includes('.mpd') ||
            url.includes('/hls/') ||
            url.includes('/dash/')
        );
    }

    private getStreamType(url: string): 'm3u8' | 'ts' | 'mpd' {
        if (url.includes('.m3u8')) return 'm3u8';
        if (url.includes('.mpd')) return 'mpd';
        return 'ts';
    }

    private log(msg: string): void {
        console.warn(`[Power Mode] ${msg}`);
    }

    getFoundStreams(): InterceptedStream[] {
        return this.streams;
    }

    getBestM3U8(): InterceptedStream | null {
        const m3u8s = this.streams.filter((s) => s.type === 'm3u8');
        if (m3u8s.length === 0) return null;

        // Prefer master playlist (no resolution in URL = likely master)
        const master = m3u8s.find(
            (s) => !(/\d{3,4}p/.test(s.url)) && !(/\d{3,4}x\d{3,4}/.test(s.url))
        );
        if (master) return master;

        // Otherwise pick highest resolution variant
        const withRes = m3u8s
            .map((s) => {
                const match = s.url.match(/(\d{3,4})p/);
                return { stream: s, res: match ? parseInt(match[1]) : 0 };
            })
            .sort((a, b) => b.res - a.res);

        return withRes[0]?.stream || m3u8s[0];
    }

    getPageTitle(): string {
        return this.pageTitle;
    }

    destroy(): void {
        if (this.window && !this.window.isDestroyed()) {
            this.window.close();
        }
        this.window = null;
        this.streams = [];
    }
}
