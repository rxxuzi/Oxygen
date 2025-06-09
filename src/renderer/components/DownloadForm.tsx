import React, { useState } from 'react';
import { useDownloadStore } from '../stores/download-store';
import { useSettingsStore } from '../stores/settings-store';
import { useAuthStore } from '../stores/auth-store';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                type="url"
                placeholder="Enter video URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isDownloading}
                className="w-full"
            />

            <div className="flex items-center gap-6">
                <Select
                    label="Quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as Quality)}
                    options={qualityOptions}
                    disabled={isDownloading || audioOnly}
                />

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={audioOnly}
                        onChange={(e) => setAudioOnly(e.target.checked)}
                        disabled={isDownloading}
                        className="w-5 h-5 rounded border-border"
                    />
                    <span className="text-sm">Audio Only</span>
                </label>
            </div>

            <Button
                type="submit"
                disabled={isDownloading || !url.trim()}
                className="w-full"
                variant="primary"
            >
                {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
        </form>
    );
}