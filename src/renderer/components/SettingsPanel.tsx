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
        <div className="settings-container">
            <div className="settings-box">
                <div className="settings-content">
                {/* Video Settings */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Video size={20} />
                        </div>
                        <h2 className="settings-section-title">Video Settings</h2>
                    </div>

                    <div className="settings-grid settings-grid-2">
                        <div className="settings-field">
                            <label className="settings-label">Format</label>
                            <div className="settings-select">
                                <select
                                    value={settings.videoFormat}
                                    onChange={(e) => updateSettings({ videoFormat: e.target.value as VideoFormat })}
                                >
                                    {videoFormatOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Output Path</label>
                            <div className="settings-path-group">
                                <input
                                    type="text"
                                    value={settings.videoOutputPath}
                                    onChange={(e) => updateSettings({ videoOutputPath: e.target.value })}
                                    className="settings-input settings-path-input"
                                    placeholder="Choose output folder..."
                                />
                                <button 
                                    onClick={() => handleBrowse('video')} 
                                    className="settings-browse-button"
                                >
                                    <FolderOpen size={16} />
                                    Browse
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audio Settings */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Music2 size={20} />
                        </div>
                        <h2 className="settings-section-title">Audio Settings</h2>
                    </div>

                    <div className="settings-grid settings-grid-2">
                        <div className="settings-field">
                            <label className="settings-label">Format</label>
                            <div className="settings-select">
                                <select
                                    value={settings.audioFormat}
                                    onChange={(e) => updateSettings({ audioFormat: e.target.value as AudioFormat })}
                                >
                                    {audioFormatOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Output Path</label>
                            <div className="settings-path-group">
                                <input
                                    type="text"
                                    value={settings.audioOutputPath}
                                    onChange={(e) => updateSettings({ audioOutputPath: e.target.value })}
                                    className="settings-input settings-path-input"
                                    placeholder="Choose output folder..."
                                />
                                <button 
                                    onClick={() => handleBrowse('audio')} 
                                    className="settings-browse-button"
                                >
                                    <FolderOpen size={16} />
                                    Browse
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Settings */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Download size={20} />
                        </div>
                        <h2 className="settings-section-title">Download Settings</h2>
                    </div>

                    <div className="settings-grid settings-grid-3">
                        <div className="settings-field">
                            <label className="settings-label">Segments</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={settings.segments}
                                onChange={(e) => updateSettings({ segments: parseInt(e.target.value) || 4 })}
                                className="settings-input"
                                placeholder="4"
                            />
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Retries</label>
                            <input
                                type="number"
                                min="0"
                                value={settings.retries}
                                onChange={(e) => updateSettings({ retries: parseInt(e.target.value) || 5 })}
                                className="settings-input"
                                placeholder="5"
                            />
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Buffer Size</label>
                            <input
                                type="text"
                                value={settings.bufferSize}
                                onChange={(e) => updateSettings({ bufferSize: e.target.value })}
                                className="settings-input"
                                placeholder="16K"
                            />
                        </div>
                    </div>
                </div>

                {/* Other Settings */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">
                            <Settings2 size={20} />
                        </div>
                        <h2 className="settings-section-title">Other Settings</h2>
                    </div>

                    <div className="settings-toggle-container">
                        <div 
                            className={`settings-toggle ${settings.writeThumbnail ? 'active' : ''}`}
                            onClick={() => updateSettings({ writeThumbnail: !settings.writeThumbnail })}
                        >
                            <div className="settings-toggle-info">
                                <span className="settings-toggle-label">Write thumbnail</span>
                                <span className="settings-toggle-description">Save thumbnail image separately</span>
                            </div>
                            <div className="settings-switch" />
                        </div>

                        <div 
                            className={`settings-toggle ${settings.embedThumbnail ? 'active' : ''}`}
                            onClick={() => updateSettings({ embedThumbnail: !settings.embedThumbnail })}
                        >
                            <div className="settings-toggle-info">
                                <span className="settings-toggle-label">Embed thumbnail</span>
                                <span className="settings-toggle-description">Embed thumbnail in media file</span>
                            </div>
                            <div className="settings-switch" />
                        </div>
                    </div>

                    <div className="settings-grid settings-grid-2" style={{ marginTop: '20px' }}>
                        <div className="settings-field">
                            <label className="settings-label">Proxy Server</label>
                            <input
                                type="text"
                                value={settings.proxy}
                                onChange={(e) => updateSettings({ proxy: e.target.value })}
                                className="settings-input"
                                placeholder="http://proxyserver:port"
                            />
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Subtitle Languages</label>
                            <input
                                type="text"
                                value={settings.subtitles}
                                onChange={(e) => updateSettings({ subtitles: e.target.value })}
                                className="settings-input"
                                placeholder="en.*,ja"
                            />
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <div className="settings-reset-section">
                    <button onClick={resetSettings} className="settings-reset-button">
                        <RotateCcw size={16} />
                        Reset to Defaults
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}