import React from 'react';
import { useSettingsStore } from '../stores/settings-store';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { VideoFormat, AudioFormat } from '../../shared/types';

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
        <div className="space-y-6">
            {/* Video Settings */}
            <div className="card">
                <h3 className="text-xl mb-4">Video Settings</h3>

                <div className="space-y-4">
                    <Select
                        label="Format"
                        value={settings.videoFormat}
                        onChange={(e) => updateSettings({ videoFormat: e.target.value as VideoFormat })}
                        options={videoFormatOptions}
                    />

                    <div>
                        <label className="block text-sm mb-2">Output Path</label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={settings.videoOutputPath}
                                onChange={(e) => updateSettings({ videoOutputPath: e.target.value })}
                                className="flex-1"
                            />
                            <Button onClick={() => handleBrowse('video')} variant="secondary">
                                Browse
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audio Settings */}
            <div className="card">
                <h3 className="text-xl mb-4">Audio Settings</h3>

                <div className="space-y-4">
                    <Select
                        label="Format"
                        value={settings.audioFormat}
                        onChange={(e) => updateSettings({ audioFormat: e.target.value as AudioFormat })}
                        options={audioFormatOptions}
                    />

                    <div>
                        <label className="block text-sm mb-2">Output Path</label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={settings.audioOutputPath}
                                onChange={(e) => updateSettings({ audioOutputPath: e.target.value })}
                                className="flex-1"
                            />
                            <Button onClick={() => handleBrowse('audio')} variant="secondary">
                                Browse
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Settings */}
            <div className="card">
                <h3 className="text-xl mb-4">Download Settings</h3>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm mb-2">Segments</label>
                        <Input
                            type="number"
                            min="1"
                            max="10"
                            value={settings.segments}
                            onChange={(e) => updateSettings({ segments: parseInt(e.target.value) || 4 })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Retries</label>
                        <Input
                            type="number"
                            min="0"
                            value={settings.retries}
                            onChange={(e) => updateSettings({ retries: parseInt(e.target.value) || 5 })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Buffer Size</label>
                        <Input
                            type="text"
                            value={settings.bufferSize}
                            onChange={(e) => updateSettings({ bufferSize: e.target.value })}
                            placeholder="16M"
                        />
                    </div>
                </div>
            </div>

            {/* Other Settings */}
            <div className="card">
                <h3 className="text-xl mb-4">Other Settings</h3>

                <div className="space-y-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.writeThumbnail}
                            onChange={(e) => updateSettings({ writeThumbnail: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <span>Write thumbnail</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.embedThumbnail}
                            onChange={(e) => updateSettings({ embedThumbnail: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <span>Embed thumbnail</span>
                    </label>

                    <div>
                        <label className="block text-sm mb-2">Proxy Server</label>
                        <Input
                            type="text"
                            value={settings.proxy}
                            onChange={(e) => updateSettings({ proxy: e.target.value })}
                            placeholder="http://proxyserver:port"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Subtitle Languages</label>
                        <Input
                            type="text"
                            value={settings.subtitles}
                            onChange={(e) => updateSettings({ subtitles: e.target.value })}
                            placeholder="en.*,ja"
                        />
                    </div>
                </div>
            </div>

            <Button onClick={resetSettings} variant="secondary" className="w-full">
                Reset to Defaults
            </Button>
        </div>
    );
}