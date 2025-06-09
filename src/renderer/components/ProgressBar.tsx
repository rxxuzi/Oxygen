import React, { useMemo } from 'react';
import { DownloadProgress } from '../../shared/types';

interface ProgressBarProps {
    progress: DownloadProgress | null;
}

export function ProgressBar({ progress }: ProgressBarProps) {
    const progressColor = useMemo(() => {
        if (!progress) return 'bg-red-500';

        const percent = progress.percent;

        if (percent < 33) return 'bg-red-500';
        if (percent < 66) return 'bg-yellow-500';
        if (percent < 100) return 'bg-green-500';
        return 'bg-blue-500';
    }, [progress?.percent]);

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!progress) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{progress.filename || 'Downloading...'}</span>
                <span>{progress.percent.toFixed(1)}%</span>
            </div>

            <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${progress.percent}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {formatBytes(progress.downloadedBytes)} / {formatBytes(progress.totalBytes)}
        </span>
                <span>
          {progress.speed} • ETA: {progress.eta}
        </span>
            </div>
        </div>
    );
}