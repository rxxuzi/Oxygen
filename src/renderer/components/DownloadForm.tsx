import React, { useState, useEffect, useRef } from 'react';
import { useDownloadStore } from '../stores/download-store';
import { useSettingsStore } from '../stores/settings-store';
import { useAuthStore } from '../stores/auth-store';
import { useClipboardPaste } from '../hooks/useClipboardPaste';
import { PasteConfirmDialog } from './PasteConfirmDialog';
import { Quality } from '../../shared/types';

export function DownloadForm() {
    const [url, setUrl] = useState('');
    const [audioOnly, setAudioOnly] = useState(false);
    const [powerMode, setPowerMode] = useState(false);
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
            powerMode,
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
        <>
            <div className={`relative w-full h-full flex flex-col items-center transition-all duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isDownloading ? 'justify-start pt-[10vh]' : 'justify-center'}`}>
                {/* Form */}
                <form onSubmit={handleSubmit} className={`w-full max-w-[560px] space-y-4 transition-all duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${isDownloading ? '-translate-y-6' : ''}`}>
                    {/* URL Input */}
                    <div className="relative z-[100]">
                        <input
                            type="url"
                            className="w-full h-14 bg-white/[0.06] border border-white/[0.1] rounded-2xl px-6 text-[15px] text-white/90 transition-all duration-200 placeholder:text-white/30 hover:border-white/[0.18] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 disabled:opacity-40 disabled:cursor-not-allowed"
                            placeholder="Paste video URL here..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onFocus={handleInputFocus}
                            disabled={isDownloading}
                            autoFocus
                        />
                    </div>

                    {/* Options */}
                    {url && !isDownloading && (
                        <div className="flex items-center gap-3 opacity-0 animate-fade-in-up-fast">
                            <div className="select-arrow flex-1">
                                <select
                                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-10 text-white/80 text-sm cursor-pointer transition-all duration-200 appearance-none font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.14] focus:outline-none focus:border-blue-500/40"
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value as Quality)}
                                    disabled={audioOnly}
                                >
                                    <option value="best" className="bg-[#111]">Best Quality</option>
                                    <option value="high" className="bg-[#111]">High (1080p)</option>
                                    <option value="medium" className="bg-[#111]">Medium (720p)</option>
                                    <option value="low" className="bg-[#111]">Low (480p)</option>
                                    <option value="worst" className="bg-[#111]">Lowest</option>
                                </select>
                            </div>

                            <div
                                className={`h-11 rounded-xl px-4 flex items-center gap-3 cursor-pointer transition-all duration-200 border ${
                                    audioOnly
                                        ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15'
                                        : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]'
                                }`}
                                onClick={() => setAudioOnly(!audioOnly)}
                            >
                                <span className="text-sm text-white/80 select-none whitespace-nowrap">Audio Only</span>
                                <div className={`toggle-switch ${audioOnly ? 'active' : ''}`} />
                            </div>

                            <div
                                className={`h-11 rounded-xl px-4 flex items-center gap-3 cursor-pointer transition-all duration-200 border ${
                                    powerMode
                                        ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15'
                                        : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]'
                                }`}
                                onClick={() => setPowerMode(!powerMode)}
                            >
                                <span className="text-sm text-white/80 select-none whitespace-nowrap">Power Mode</span>
                                <div className={`toggle-switch ${powerMode ? 'active-amber' : ''}`} />
                            </div>
                        </div>
                    )}

                    {/* Download Button */}
                    <button
                        type="submit"
                        className="download-btn-hover w-full h-14 bg-gradient-to-b from-blue-500 to-blue-600 rounded-2xl text-white text-[15px] font-medium transition-all duration-200 flex items-center justify-center gap-2.5 relative overflow-hidden disabled:bg-none disabled:bg-white/[0.06] disabled:text-white/20 disabled:cursor-not-allowed"
                        disabled={isDownloading || !url.trim()}
                    >
                        {isDownloading ? (
                            <>
                                <svg className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin relative z-[1]" viewBox="0 0 24 24" />
                                <span className="relative z-[1]">Downloading...</span>
                            </>
                        ) : (
                            <>
                                <svg className="relative z-[1]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span className="relative z-[1]">Download</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Progress Section */}
                {isDownloading && (
                    <div className="w-full max-w-[680px] mt-8 space-y-4 opacity-0 animate-fade-in-up-fast">
                        {/* Status Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                <span className="text-sm text-white/70 font-medium">
                                    {phase === 'processing' ? 'Processing' : 'Downloading'}
                                </span>
                                {phase === 'processing' && (
                                    <div className="flex gap-[3px]">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-processing-pulse" />
                                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-processing-pulse [animation-delay:0.2s]" />
                                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-processing-pulse [animation-delay:0.4s]" />
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={cancelDownload}
                                className="text-[13px] text-white/30 hover:text-red-400 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Progress Details */}
                        {progress && (
                            <div>
                                <div className="flex justify-between items-baseline mb-2.5">
                                    <span className="text-sm text-white/60 truncate max-w-[70%]">
                                        {progress.filename || 'Preparing...'}
                                    </span>
                                    <span className="text-xl font-semibold text-white tabular-nums">
                                        {Math.round(progress.percent || 0)}%
                                    </span>
                                </div>

                                <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
                                    <div
                                        className="progress-shimmer h-full bg-blue-500 rounded-full transition-[width] duration-300 ease-out"
                                        style={{ width: `${progress.percent || 0}%` }}
                                    />
                                </div>

                                <div className="flex items-center gap-5 mt-3 text-[13px] text-white/35">
                                    <span>{progress.speed || '—'}</span>
                                    <span className="text-white/10">|</span>
                                    <span>{formatBytes(progress.downloadedBytes || 0)} / {formatBytes(progress.totalBytes || 0)}</span>
                                    <span className="text-white/10">|</span>
                                    <span>{progress.eta || '—'}</span>
                                </div>
                            </div>
                        )}

                        {/* Console Output */}
                        <div
                            className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 h-52 overflow-y-auto font-mono scrollbar-thin"
                            ref={consoleRef}
                        >
                            {logs.length === 0 ? (
                                <span className="text-[11px] text-white/20">Waiting for output...</span>
                            ) : (
                                <div className="space-y-px">
                                    {logs.slice(-50).map((log, index) => (
                                        <div key={index} className="flex items-start gap-2 text-[11px] leading-relaxed">
                                            <span className="text-blue-400/40 shrink-0">{formatTime(log.split(']')[0] + ']')}</span>
                                            <span className="text-white/40 break-words">{log.split('] ')[1] || log}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Paste confirmation toast */}
            <PasteConfirmDialog
                isVisible={isDialogVisible}
                clipboardText={clipboardText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    );
}
