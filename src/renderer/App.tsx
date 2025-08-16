import React, { useState, useEffect } from 'react';
import { Download, Settings, FileText, Shield, Minimize2, Maximize2, X, Square } from 'lucide-react';
import { OxygenIcon } from './components/ui/OxygenIcon';
import { DownloadForm } from './components/DownloadForm';
import { SettingsPanel } from './components/SettingsPanel';
import { LogsViewer } from './components/LogsViewer';
import { AuthPanel } from './components/AuthPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useDownloadStore } from './stores/download-store';
import { useSettingsStore } from './stores/settings-store';

export default function App() {
    const [activeTab, setActiveTab] = useState('main');
    const [isMaximized, setIsMaximized] = useState(false);
    const { isDownloading, progress } = useDownloadStore();
    const { loadSettings } = useSettingsStore();

    useEffect(() => {
        // Load settings on app start
        loadSettings();
        
        // Check if window is maximized
        const checkMaximized = async () => {
            const maximized = await window.electron.window.isMaximized();
            setIsMaximized(maximized);
        };
        checkMaximized();
    }, [loadSettings]);

    const tabs = [
        { id: 'main', label: 'Download', icon: Download },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'logs', label: 'Logs', icon: FileText },
        { id: 'auth', label: 'Auth', icon: Shield }
    ];

    const handleMinimize = () => {
        window.electron.window.minimize();
    };

    const handleMaximize = async () => {
        await window.electron.window.maximize();
        const maximized = await window.electron.window.isMaximized();
        setIsMaximized(maximized);
    };

    const handleClose = () => {
        window.electron.window.close();
    };

    return (
        <ErrorBoundary>
            <div className="h-screen flex flex-col bg-black overflow-hidden select-none">
            {/* Custom Title Bar with Drag Region */}
            <div 
                className="flex items-center h-8 bg-zinc-900 border-b border-zinc-800 relative"
                style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
            >
                {/* Left: App Icon and Title */}
                <div className="flex items-center space-x-3 px-4">
                    <OxygenIcon size={16} className="text-blue-400" />
                    <h1 className="text-xs font-medium text-zinc-200">Oxygen</h1>
                </div>
                
                {/* Center: Draggable Area */}
                <div className="flex-1"></div>
                
                {/* Right: Window Controls */}
                <div 
                    className="flex items-center"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    <button 
                        onClick={handleMinimize}
                        className="w-12 h-8 flex items-center justify-center hover:bg-zinc-700/50 transition-colors duration-150"
                        title="Minimize"
                    >
                        <Minimize2 className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
                    </button>
                    <button 
                        onClick={handleMaximize}
                        className="w-12 h-8 flex items-center justify-center hover:bg-zinc-700/50 transition-colors duration-150"
                        title={isMaximized ? "Restore" : "Maximize"}
                    >
                        {isMaximized ? (
                            <Square className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
                        ) : (
                            <Maximize2 className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
                        )}
                    </button>
                    <button 
                        onClick={handleClose}
                        className="w-12 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors duration-150"
                        title="Close"
                    >
                        <X className="w-4 h-4 text-zinc-400 hover:text-white" />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col">
                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 select-none">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-zinc-800/80 text-zinc-100'
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${
                                        activeTab === tab.id ? 'text-blue-400' : ''
                                    }`} />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Download Status in Sidebar */}
                    {isDownloading && (
                        <div className="p-3 border-t border-zinc-800">
                            <div className="bg-zinc-800/80 rounded-lg p-4 border border-zinc-700/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-300">Downloading</span>
                                    <span className="text-xs text-blue-400 font-mono">{progress?.percent || 0}%</span>
                                </div>
                                <div className="text-xs text-zinc-500 truncate mt-2">
                                    {progress?.filename || 'Preparing...'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                    {/* Fixed Header for each tab */}
                    <div className="px-8 pt-8 pb-4">
                        {activeTab === 'main' && (
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                Download
                            </h2>
                        )}
                        {activeTab === 'settings' && (
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                Settings
                            </h2>
                        )}
                        {activeTab === 'logs' && (
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                Download Logs
                            </h2>
                        )}
                        {activeTab === 'auth' && (
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                Authentication
                            </h2>
                        )}
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="px-8 pb-8 space-y-8 max-w-5xl mx-auto">
                            {/* Main Download Tab */}
                            {activeTab === 'main' && <DownloadForm />}

                            {/* Settings Tab */}
                            {activeTab === 'settings' && <SettingsPanel />}

                            {/* Logs Tab */}
                            {activeTab === 'logs' && <LogsViewer />}

                            {/* Auth Tab */}
                            {activeTab === 'auth' && <AuthPanel />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </ErrorBoundary>
    );
}