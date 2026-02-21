import React from 'react';
import { useSettingsStore } from '../stores/settings-store';
import { VideoFormat, AudioFormat } from '../../shared/types';
import {
    Video,
    Music2,
    Download,
    Settings2,
    FolderOpen,
    RotateCcw
} from 'lucide-react';

export function SettingsPanel() {
    const { settings, updateSettings, resetSettings } = useSettingsStore();

    const handleBrowse = async (type: 'video' | 'audio') => {
        const path = await window.electron.dialog.openFolder();
        if (path) {
            updateSettings({
                [type === 'video' ? 'videoOutputPath' : 'audioOutputPath']: path
            });
        }
    };

    const videoFormatOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'mp4', label: 'MP4' },
        { value: 'mov', label: 'MOV' },
        { value: 'webm', label: 'WebM' }
    ];

    const audioFormatOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'mp3', label: 'MP3' },
        { value: 'wav', label: 'WAV' },
        { value: 'aac', label: 'AAC' }
    ];

    return (
        <div className="relative w-full h-full p-10 overflow-y-auto overflow-x-hidden scrollbar-panel max-md:px-4 max-md:py-6">
            <div className="w-full max-w-[800px] mx-auto animate-fade-in-up">
                <div className="w-full">
                {/* Video Settings */}
                <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="text-white/40 text-lg">
                            <Video size={20} />
                        </div>
                        <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Video Settings</h2>
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Format</label>
                            <div className="select-arrow">
                                <select
                                    value={settings.videoFormat}
                                    onChange={(e) => updateSettings({ videoFormat: e.target.value as VideoFormat })}
                                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 pr-10 text-white/90 text-sm font-normal cursor-pointer transition-all duration-200 appearance-none font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                                >
                                    {videoFormatOptions.map(option => (
                                        <option key={option.value} value={option.value} className="bg-[#1a1a1a] text-white/90">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Output Path</label>
                            <div className="flex gap-2 items-stretch w-full max-md:flex-col">
                                <input
                                    type="text"
                                    value={settings.videoOutputPath}
                                    onChange={(e) => updateSettings({ videoOutputPath: e.target.value })}
                                    className="flex-1 min-w-0 w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                    placeholder="Choose output folder..."
                                />
                                <button
                                    onClick={() => handleBrowse('video')}
                                    className="px-5 h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/70 text-[13px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/90 active:scale-[0.98] max-md:w-full max-md:justify-center"
                                >
                                    <FolderOpen size={16} />
                                    Browse
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audio Settings */}
                <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="text-white/40 text-lg">
                            <Music2 size={20} />
                        </div>
                        <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Audio Settings</h2>
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Format</label>
                            <div className="select-arrow">
                                <select
                                    value={settings.audioFormat}
                                    onChange={(e) => updateSettings({ audioFormat: e.target.value as AudioFormat })}
                                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 pr-10 text-white/90 text-sm font-normal cursor-pointer transition-all duration-200 appearance-none font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                                >
                                    {audioFormatOptions.map(option => (
                                        <option key={option.value} value={option.value} className="bg-[#1a1a1a] text-white/90">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Output Path</label>
                            <div className="flex gap-2 items-stretch w-full max-md:flex-col">
                                <input
                                    type="text"
                                    value={settings.audioOutputPath}
                                    onChange={(e) => updateSettings({ audioOutputPath: e.target.value })}
                                    className="flex-1 min-w-0 w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                    placeholder="Choose output folder..."
                                />
                                <button
                                    onClick={() => handleBrowse('audio')}
                                    className="px-5 h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/70 text-[13px] font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/90 active:scale-[0.98] max-md:w-full max-md:justify-center"
                                >
                                    <FolderOpen size={16} />
                                    Browse
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Settings */}
                <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="text-white/40 text-lg">
                            <Download size={20} />
                        </div>
                        <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Download Settings</h2>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 max-md:grid-cols-1">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Segments</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={settings.segments}
                                onChange={(e) => updateSettings({ segments: parseInt(e.target.value) || 4 })}
                                className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                placeholder="4"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Retries</label>
                            <input
                                type="number"
                                min="0"
                                value={settings.retries}
                                onChange={(e) => updateSettings({ retries: parseInt(e.target.value) || 5 })}
                                className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                placeholder="5"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Buffer Size</label>
                            <input
                                type="text"
                                value={settings.bufferSize}
                                onChange={(e) => updateSettings({ bufferSize: e.target.value })}
                                className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                placeholder="16K"
                            />
                        </div>
                    </div>
                </div>

                {/* Other Settings */}
                <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="text-white/40 text-lg">
                            <Settings2 size={20} />
                        </div>
                        <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Other Settings</h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div
                            className={`min-h-[56px] bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all duration-200 relative overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] ${settings.writeThumbnail ? 'bg-white/[0.04]' : ''}`}
                            onClick={() => updateSettings({ writeThumbnail: !settings.writeThumbnail })}
                        >
                            <div className="flex flex-col gap-0.5 flex-1">
                                <span className="text-sm text-white/90 font-medium tracking-[0.01em]">Write thumbnail</span>
                                <span className="text-xs text-white/40 leading-relaxed">Save thumbnail image separately</span>
                            </div>
                            <div className={`toggle-switch ${settings.writeThumbnail ? 'active' : ''}`} />
                        </div>

                        <div
                            className={`min-h-[56px] bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all duration-200 relative overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] ${settings.embedThumbnail ? 'bg-white/[0.04]' : ''}`}
                            onClick={() => updateSettings({ embedThumbnail: !settings.embedThumbnail })}
                        >
                            <div className="flex flex-col gap-0.5 flex-1">
                                <span className="text-sm text-white/90 font-medium tracking-[0.01em]">Embed thumbnail</span>
                                <span className="text-xs text-white/40 leading-relaxed">Embed thumbnail in media file</span>
                            </div>
                            <div className={`toggle-switch ${settings.embedThumbnail ? 'active' : ''}`} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 mt-5">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Proxy Server</label>
                            <input
                                type="text"
                                value={settings.proxy}
                                onChange={(e) => updateSettings({ proxy: e.target.value })}
                                className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                placeholder="http://proxyserver:port"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Subtitle Languages</label>
                            <input
                                type="text"
                                value={settings.subtitles}
                                onChange={(e) => updateSettings({ subtitles: e.target.value })}
                                className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                placeholder="en.*,ja"
                            />
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <div className="mt-8 pt-8 border-t border-white/[0.04]">
                    <button onClick={resetSettings} className="w-full h-11 bg-transparent border border-white/[0.08] rounded-[10px] text-white/50 text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-red-500/5 hover:border-red-500/30 hover:text-red-500/80 active:scale-[0.98]">
                        <RotateCcw size={16} />
                        Reset to Defaults
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}
