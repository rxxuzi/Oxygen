import React, { useState } from 'react';
import { useDownloadStore } from '../stores/download-store';
import { useSettingsStore } from '../stores/settings-store';
import { useAuthStore } from '../stores/auth-store';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Card } from './ui/card';
import { DownloadIcon } from './ui/OxygenIcon';
import { Quality } from '../../shared/types';

export function DownloadForm() {
    const [url, setUrl] = useState('');
    const [audioOnly, setAudioOnly] = useState(false);
    const [quality, setQuality] = useState<Quality>('best');

    const { isDownloading, startDownload } = useDownloadStore();
    const { settings } = useSettingsStore();
    const { getAuthForUrl } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            alert('Please enter a URL');
            return;
        }

        // Get auth data for the URL if available
        const authData = await getAuthForUrl(url);

        const options = {
            outputPath: audioOnly ? settings.audioOutputPath : settings.videoOutputPath,
            audioOnly,
            quality,
            videoFormat: settings.videoFormat,
            audioFormat: settings.audioFormat,
            proxy: settings.proxy,
            subtitles: settings.subtitles,
            thumbnail: settings.writeThumbnail,
            embedThumbnail: settings.embedThumbnail,
            segments: settings.segments,
            retries: settings.retries,
            bufferSize: settings.bufferSize,
            ...authData
        };

        startDownload(url, options);
        setUrl('');
    };

    const qualityOptions = [
        { value: 'best', label: 'Best' },
        { value: 'high', label: 'High (1080p)' },
        { value: 'medium', label: 'Medium (720p)' },
        { value: 'low', label: 'Low (480p)' },
        { value: 'worst', label: 'Worst' }
    ];

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="url-input" className="block text-sm font-medium text-foreground">
                        Video URL
                    </label>
                    <Input
                        id="url-input"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isDownloading}
                        className="w-full text-base"
                        aria-describedby="url-help"
                    />
                    <p id="url-help" className="text-xs text-muted-foreground">
                        Paste a video URL from YouTube, Vimeo, or other supported platforms
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Video Quality"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value as Quality)}
                        options={qualityOptions}
                        disabled={isDownloading || audioOnly}
                    />

                    <div className="flex items-center justify-center">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-input hover:bg-accent transition-colors">
                            <input
                                type="checkbox"
                                checked={audioOnly}
                                onChange={(e) => setAudioOnly(e.target.checked)}
                                disabled={isDownloading}
                                className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                aria-describedby="audio-only-help"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Audio Only</span>
                                <span className="text-xs text-muted-foreground">Download audio track only</span>
                            </div>
                        </label>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isDownloading || !url.trim()}
                    className="w-full"
                    variant="primary"
                    size="lg"
                    loading={isDownloading}
                >
                    <DownloadIcon className="mr-2" size={18} />
                    {isDownloading ? 'Downloading...' : 'Start Download'}
                </Button>
            </form>
        </Card>
    );
}