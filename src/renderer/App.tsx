import React, { useState, useEffect } from 'react';
import { Download, Settings, FileText, Shield } from 'lucide-react';
import { OxygenIcon } from './components/ui/OxygenIcon';
import { DownloadForm } from './components/DownloadForm';
import { ProgressBar } from './components/ProgressBar';
import { SettingsPanel } from './components/SettingsPanel';
import { LogsViewer } from './components/LogsViewer';
import { AuthPanel } from './components/AuthPanel';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/card';
import { useDownloadStore } from './stores/download-store';
import { useSettingsStore } from './stores/settings-store';

export default function App() {
    const [activeTab, setActiveTab] = useState('main');
    const { isDownloading, progress } = useDownloadStore();
    const { loadSettings } = useSettingsStore();

    useEffect(() => {
        // Load settings on app start
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        // Set dark mode
        document.documentElement.classList.add('dark');
    }, []);

    const tabs = [
        { id: 'main', label: 'Download', icon: Download },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'logs', label: 'Logs', icon: FileText },
        { id: 'auth', label: 'Auth', icon: Shield }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="flex items-center space-x-3">
                        <OxygenIcon size={32} className="flex-shrink-0" />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold">Oxygen</h1>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                        <div className="text-sm text-muted-foreground">
                            Video & Audio Downloader
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="border-b">
                <div className="container">
                    <nav className="flex space-x-8 py-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80 ${
                                        activeTab === tab.id
                                            ? 'text-foreground border-b-2 border-primary pb-2'
                                            : 'text-foreground/60'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="container py-6">
                {/* Main Tab */}
                {activeTab === 'main' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Download</h2>
                            <p className="text-muted-foreground">
                                Download videos and audio from various platforms
                            </p>
                        </div>

                        <DownloadForm />

                        {isDownloading && (
                            <Card className="p-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Download Progress</h3>
                                    <ProgressBar progress={progress} />
                                </div>
                            </Card>
                        )}

                        <Card className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Console Output</h3>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => useDownloadStore.getState().clearLogs()}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                const { settings } = useSettingsStore.getState();
                                                window.electron.shell.openPath(settings.videoOutputPath);
                                            }}
                                        >
                                            Open Folder
                                        </Button>
                                    </div>
                                </div>
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                                        {useDownloadStore.getState().logs.join('\n') || 'Download logs will appear here...'}
                                    </pre>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                            <p className="text-muted-foreground">
                                Configure download preferences and output settings
                            </p>
                        </div>
                        <SettingsPanel />
                    </div>
                )}

                {/* Logs Tab */}
                {activeTab === 'logs' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Download History</h2>
                            <p className="text-muted-foreground">
                                View and manage your download history
                            </p>
                        </div>
                        <LogsViewer />
                    </div>
                )}

                {/* Auth Tab */}
                {activeTab === 'auth' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Authentication</h2>
                            <p className="text-muted-foreground">
                                Manage authentication for various platforms
                            </p>
                        </div>
                        <AuthPanel />
                    </div>
                )}
            </main>
        </div>
    );
}