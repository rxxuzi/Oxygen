import React, { useState, useEffect, useRef } from 'react';
import { useDownloadStore } from '../stores/download-store';
import { useSettingsStore } from '../stores/settings-store';
import { useAuthStore } from '../stores/auth-store';
import { useClipboardPaste } from '../hooks/useClipboardPaste';
import { PasteConfirmDialog } from './PasteConfirmDialog';
import { Quality } from '../../shared/types';
import '../styles/download.css';

export function DownloadForm() {
    const [url, setUrl] = useState('');
    const [audioOnly, setAudioOnly] = useState(false);
    const [quality, setQuality] = useState<Quality>('best');
    const [phase, setPhase] = useState<'idle' | 'downloading' | 'processing'>('idle');
    const consoleRef = useRef<HTMLDivElement>(null);

    const { isDownloading, progress, logs, startDownload, cancelDownload } = useDownloadStore();
    const { settings } = useSettingsStore();
    const { getAuthForUrl } = useAuthStore();

    // Clipboard paste functionality
    const {
        isDialogVisible,
        clipboardText,
        position,
        handleInputFocus,
        handleConfirm,
        handleCancel
    } = useClipboardPaste({
        onPaste: setUrl,
        enabled: true
    });

    // Auto-scroll console to bottom when new logs appear
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [logs]);

    // Update phase based on progress
    useEffect(() => {
        if (isDownloading) {
            if (progress && progress.percent > 95) {
                setPhase('processing');
            } else {
                setPhase('downloading');
            }
        } else {
            setPhase('idle');
        }
    }, [isDownloading, progress]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) return;

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

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatTime = (timestamp: string): string => {
        return timestamp.split(' ')[1] || timestamp;
    };

    return (
        <div className={`download-container ${isDownloading ? 'downloading' : ''}`}>
            <div className={`download-box ${isDownloading ? 'compact' : ''}`}>
                <form onSubmit={handleSubmit}>
                    <div className="url-input-wrapper">
                        <input
                            type="url"
                            className="url-input"
                            placeholder="Paste video URL here..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onFocus={handleInputFocus}
                            disabled={isDownloading}
                            autoFocus
                        />
                        {/* Paste confirmation dialog */}
                        <PasteConfirmDialog
                            isVisible={isDialogVisible}
                            clipboardText={clipboardText}
                            position={position}
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                        />
                    </div>

                    {url && !isDownloading && (
                        <div className="options-grid">
                            <div className="quality-selector">
                                <select
                                    className="quality-select"
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value as Quality)}
                                    disabled={audioOnly}
                                >
                                    <option value="best">Best Quality</option>
                                    <option value="high">High (1080p)</option>
                                    <option value="medium">Medium (720p)</option>
                                    <option value="low">Low (480p)</option>
                                    <option value="worst">Lowest</option>
                                </select>
                            </div>

                            <div
                                className={`audio-toggle ${audioOnly ? 'active' : ''}`}
                                onClick={() => setAudioOnly(!audioOnly)}
                            >
                                <span className="audio-toggle-label">Audio Only</span>
                                <div className="audio-toggle-switch" />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="download-button"
                        disabled={isDownloading || !url.trim()}
                    >
                        {isDownloading ? (
                            <>
                                <svg className="status-spinner" viewBox="0 0 24 24" />
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span>Download</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {isDownloading && (
                <div className="progress-section">
                    <div className="status-header">
                        <div className="status-text">
                            <span className="status-label">STATUS</span>
                            <div className="processing-phase">
                                <span className="status-phase">
                                    {phase === 'processing' ? 'Processing' : 'Downloading'}
                                </span>
                                {phase === 'processing' && (
                                    <div className="processing-dots">
                                        <div className="processing-dot" />
                                        <div className="processing-dot" />
                                        <div className="processing-dot" />
                                    </div>
                                )}
                            </div>
                            <div className="status-spinner" />
                        </div>
                        <button
                            type="button"
                            onClick={cancelDownload}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                    </div>

                    {progress && (
                        <div className="progress-bar-container">
                            <div className="progress-info">
                                <span className="progress-filename">
                                    {progress.filename || 'Preparing download...'}
                                </span>
                                <span className="progress-percent">
                                    {Math.round(progress.percent || 0)}%
                                </span>
                            </div>

                            <div className="progress-bar-wrapper">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${progress.percent || 0}%` }}
                                />
                            </div>

                            <div className="progress-stats">
                                <div className="progress-stat">
                                    <div className="progress-stat-label">SPEED</div>
                                    <div className="progress-stat-value">{progress.speed || '0 B/s'}</div>
                                </div>
                                <div className="progress-stat">
                                    <div className="progress-stat-label">DOWNLOADED</div>
                                    <div className="progress-stat-value">
                                        {formatBytes(progress.downloadedBytes || 0)} / {formatBytes(progress.totalBytes || 0)}
                                    </div>
                                </div>
                                <div className="progress-stat">
                                    <div className="progress-stat-label">TIME LEFT</div>
                                    <div className="progress-stat-value">{progress.eta || '00:00'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="console-container custom-scrollbar" ref={consoleRef}>
                        <div className="console-header">
                            <span className="console-title">Console Output</span>
                        </div>
                        <div className="console-output">
                            {logs.length === 0 ? (
                                <div className="console-line">
                                    <span className="console-timestamp">[00:00:00]</span>
                                    <span className="console-message">Waiting for output...</span>
                                </div>
                            ) : (
                                logs.slice(-50).map((log, index) => (
                                    <div key={index} className="console-line">
                                        <span className="console-timestamp">{formatTime(log.split(']')[0] + ']')}</span>
                                        <span className="console-message">{log.split('] ')[1] || log}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}