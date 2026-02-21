import React, { useEffect, useState } from 'react';
import { useLibraryStore } from '../stores/library-store';
import { LibraryFile } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import {
    FolderPlus,
    Search,
    Play,
    Heart,
    HeartOff,
    Folder,
    Copy,
    Trash2,
    Edit3,
    Move,
    RotateCcw,
    Video,
    Music,
    HardDrive,
    Database,
    AlertTriangle
} from 'lucide-react';

export function LibraryPanel() {
    const {
        files,
        filteredFiles,
        isLoading,
        isScanning,
        filter,
        sort,
        selectedFiles,
        loadFiles,
        scanDirectory,
        scanDownloadPaths,
        removeFile,
        updateFile,
        deleteFile,
        renameFile,
        copyPath,
        cleanLibrary,
        setFilter,
        setSort,
        selectFile,
        clearSelection,
        toggleSelection
    } = useLibraryStore();

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: LibraryFile } | null>(null);
    const [editingFile, setEditingFile] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [searchMode, setSearchMode] = useState<'text' | 'regex'>('text');
    const [libraryStats, setLibraryStats] = useState<any>(null);
    const [isLibraryLoading, setIsLibraryLoading] = useState(false);
    const [showManagement, setShowManagement] = useState(false);

    useEffect(() => {
        loadFiles();
        // Auto-populate from downloads only
        handleAutoScan();
        loadLibraryStats();
    }, [loadFiles]);

    // Detect if search contains regex patterns
    useEffect(() => {
        if (filter.search) {
            const regexPatterns = ['.', '*', '+', '?', '^', '$', '[', ']', '(', ')', '{', '}', '|', '\\'];
            const hasRegexChars = regexPatterns.some(char => filter.search.includes(char));
            setSearchMode(hasRegexChars ? 'regex' : 'text');
        } else {
            setSearchMode('text');
        }
    }, [filter.search]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleScanDirectory = async () => {
        const result = await window.electron.dialog.openFolder();
        if (result) {
            await scanDirectory(result);
        }
    };

    const loadLibraryStats = async () => {
        try {
            const stats = await window.electron.invoke(IPC_CHANNELS.LIBRARY_GET_STATS);
            setLibraryStats(stats);
        } catch (error) {
            console.error('Failed to load library stats:', error);
        }
    };

    const handleAutoScan = async () => {
        try {
            // Get settings for download paths
            const settings = await window.electron.invoke('settings:get');
            const downloadPaths = [settings.videoOutputPath, settings.audioOutputPath];

            // Scan download paths only (no logs)
            await scanDownloadPaths(downloadPaths);
            await loadLibraryStats();
        } catch (error) {
            console.error('Failed to auto-scan downloads:', error);
        }
    };

    const handleAddFiles = async () => {
        // This would need a file picker dialog - for now we'll use folder scan
        await handleScanDirectory();
        await loadLibraryStats();
    };

    const handleLibraryAction = async (action: string, confirmMessage?: string) => {
        if (confirmMessage && !confirm(confirmMessage)) {
            return;
        }

        setIsLibraryLoading(true);
        try {
            let result;
            switch (action) {
                case 'reset-play-counts':
                    result = await window.electron.invoke(IPC_CHANNELS.LIBRARY_RESET_PLAY_COUNTS);
                    alert(`Reset play counts for ${result} files`);
                    break;
                case 'reset-favorites':
                    result = await window.electron.invoke(IPC_CHANNELS.LIBRARY_RESET_FAVORITES);
                    alert(`Reset favorites for ${result} files`);
                    break;
                case 'clear':
                    result = await window.electron.invoke(IPC_CHANNELS.LIBRARY_CLEAR);
                    alert(`Cleared entire library (${result} files)`);
                    break;
            }
            await loadFiles();
            await loadLibraryStats();
        } catch (error) {
            console.error(`Failed to ${action}:`, error);
            alert(`Failed to ${action}. Please try again.`);
        } finally {
            setIsLibraryLoading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const handleContextMenu = (e: React.MouseEvent, file: LibraryFile) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            file
        });
    };

    const handlePlay = async (file: LibraryFile) => {
        try {
            await window.electron.invoke('shell:open-external', file.path);

            // Update play count
            await updateFile(file.id, {
                playCount: file.playCount + 1,
                lastPlayed: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to open file in OS player:', error);
        }
    };

    const handleToggleFavorite = async (file: LibraryFile) => {
        await updateFile(file.id, { favorite: !file.favorite });
    };

    const handleStartRename = (file: LibraryFile) => {
        setEditingFile(file.id);
        setNewFileName(file.filename);
        setContextMenu(null);
    };

    const handleRename = async (fileId: string) => {
        if (newFileName.trim() && newFileName !== files.find(f => f.id === fileId)?.filename) {
            await renameFile(fileId, newFileName.trim());
        }
        setEditingFile(null);
        setNewFileName('');
    };

    const handleDelete = async (file: LibraryFile) => {
        if (confirm(`Are you sure you want to delete "${file.filename}"? This will permanently delete the file from your system.`)) {
            await deleteFile(file.id);
        }
        setContextMenu(null);
    };

    const handleRemoveFromLibrary = async (file: LibraryFile) => {
        if (confirm(`Remove "${file.filename}" from library? The file will not be deleted from your system.`)) {
            await removeFile(file.id);
        }
        setContextMenu(null);
    };

    const handleCopyPath = async (file: LibraryFile) => {
        await copyPath(file.id);
        setContextMenu(null);
    };

    const handleOpenFolder = async (file: LibraryFile) => {
        await window.electron.shell.showItemInFolder(file.path);
        setContextMenu(null);
    };

    const formatDurationDisplay = (seconds?: number): string => {
        if (!seconds) return '';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    const FileListItem = ({ file }: { file: LibraryFile }) => (
        <div
            className={`grid grid-cols-[60px_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 bg-white/[0.02] border border-white/[0.04] rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.08] hover:translate-x-1 max-md:grid-cols-[48px_1fr_auto] max-md:gap-3 max-md:px-4 max-md:py-3 max-[480px]:grid-cols-[40px_1fr_auto] max-[480px]:gap-2 max-[480px]:px-3 max-[480px]:py-2.5 ${selectedFiles.has(file.id) ? 'bg-blue-500/[0.08] border-blue-500/30 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]' : ''}`}
            onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                    toggleSelection(file.id);
                } else {
                    clearSelection();
                    selectFile(file.id);
                }
            }}
            onDoubleClick={() => handlePlay(file)}
            onContextMenu={(e) => handleContextMenu(e, file)}
        >
            {/* Thumbnail/Icon */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/30 flex items-center justify-center max-md:w-10 max-md:h-10 max-[480px]:w-8 max-[480px]:h-8">
                {file.thumbnail ? (
                    <img
                        src={`file:///${file.thumbnail.replace(/\\/g, '/')}`}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                                parent.classList.add('bg-gradient-to-br', 'from-red-500/20', 'to-purple-500/20');
                            }
                        }}
                    />
                ) : (
                    <div className="text-white/40">
                        {file.type === 'video' ? <Video size={24} /> : <Music size={24} />}
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="min-w-0 flex-1">
                {editingFile === file.id ? (
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onBlur={() => handleRename(file.id)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleRename(file.id);
                            } else if (e.key === 'Escape') {
                                setEditingFile(null);
                                setNewFileName('');
                            }
                        }}
                        className="w-full bg-white/[0.08] border border-blue-500/50 rounded-md px-2 py-1 text-[13px] text-white/90 font-[inherit]"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="text-sm font-medium text-white/90 mb-1 overflow-hidden text-ellipsis whitespace-nowrap" title={file.filename}>
                        {file.filename}
                    </div>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                    <span>{file.format.toUpperCase()}</span>
                    <span className="text-white/30">&bull;</span>
                    <span>{formatFileSize(file.size)}</span>
                    {file.width && file.height && (
                        <>
                            <span className="text-white/30">&bull;</span>
                            <span>{file.width}&times;{file.height}</span>
                        </>
                    )}
                    {file.duration && (
                        <>
                            <span className="text-white/30">&bull;</span>
                            <span>{formatDurationDisplay(file.duration)}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Badges */}
            <div className="flex gap-1.5 items-center max-md:hidden">
                {file.favorite && (
                    <div className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-500/90 text-[10px] font-semibold flex items-center gap-[3px]">
                        <Heart size={12} fill="currentColor" />
                    </div>
                )}
                {file.playCount > 0 && (
                    <div className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-500/90 text-[10px] font-semibold flex items-center gap-[3px]">
                        &#9654; {file.playCount}
                    </div>
                )}
            </div>

            {/* Date - hidden on small screens */}
            <div className="text-xs text-white/50 min-w-[80px] max-md:hidden">
                {new Date(file.addedAt).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
                <button
                    className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-500/90 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-blue-500/25 hover:border-blue-500/50 hover:scale-110"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(file);
                    }}
                    title="Play in OS media player"
                >
                    <Play size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-transparent min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-10 pt-6 pb-4 border-b border-white/[0.04] shrink-0 flex-wrap gap-4 max-[900px]:px-5 max-[900px]:pt-4 max-[900px]:pb-3 max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:gap-3 max-md:px-5 max-md:pt-4 max-md:pb-3 max-md:flex-col max-md:gap-3 max-md:items-stretch max-[480px]:px-4 max-[480px]:pt-3 max-[480px]:pb-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-xl font-semibold text-white/90">
                        <HardDrive size={24} />
                        Library
                    </div>
                    <div className="text-xs text-white/40 tracking-[0.02em]">
                        {files.length} files &bull; {filteredFiles.length} shown
                    </div>
                </div>

                <div className="flex gap-3 max-[900px]:flex-wrap">
                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] bg-blue-500/10 border border-blue-500/30 text-blue-500/90 hover:bg-blue-500/15 hover:border-blue-500/40 hover:text-blue-500 ${showManagement ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' : ''}`}
                        onClick={() => setShowManagement(!showManagement)}
                    >
                        <Database size={16} />
                        Manage
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 px-10 py-4 border-b border-white/[0.04] shrink-0 flex-wrap max-[900px]:px-5 max-[900px]:py-3 max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:gap-3 max-md:px-5 max-md:py-3 max-md:flex-col max-md:items-stretch max-md:gap-3 max-[480px]:px-4 max-[480px]:py-2">
                <div className="relative flex-1 max-w-[300px] flex items-center max-[900px]:max-w-none">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 z-[1]" />
                    <input
                        type="text"
                        placeholder='Search files... (regex supported: .*\.mp4$ or ^video.*)'
                        value={filter.search}
                        onChange={(e) => setFilter({ search: e.target.value })}
                        className={`w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 text-[13px] text-white/90 transition-all duration-200 font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30 ${searchMode === 'regex' ? 'border-green-500/50 shadow-[0_0_0_1px_rgba(34,197,94,0.2)]' : ''}`}
                        title="Supports regular expressions. Examples: .*\.mp4$ (files ending with .mp4), ^video.* (files starting with 'video')"
                    />
                    {searchMode === 'regex' && filter.search && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="bg-green-500/20 text-green-500/90 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-[0.5px]">REGEX</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 max-[900px]:flex-wrap max-md:flex-wrap">
                    <select
                        value={filter.type}
                        onChange={(e) => setFilter({ type: e.target.value as any })}
                        className="h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 text-[13px] text-white/90 cursor-pointer transition-all duration-200 font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50"
                    >
                        <option value="all" className="bg-[#1a1a1a] text-white/90">All Files</option>
                        <option value="video" className="bg-[#1a1a1a] text-white/90">Videos</option>
                        <option value="audio" className="bg-[#1a1a1a] text-white/90">Audio</option>
                    </select>

                    <button
                        className={`flex items-center gap-1.5 h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/80 ${filter.favorite ? 'bg-red-500/15 border-red-500/30 text-red-500/90' : ''}`}
                        onClick={() => setFilter({ favorite: !filter.favorite })}
                    >
                        <Heart size={14} />
                        Favorites
                    </button>

                    <select
                        value={`${sort.field}-${sort.order}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSort({ field: field as any, order: order as any });
                        }}
                        className="h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 text-[13px] text-white/90 cursor-pointer transition-all duration-200 font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50"
                    >
                        <option value="addedAt-desc" className="bg-[#1a1a1a] text-white/90">Recently Added</option>
                        <option value="addedAt-asc" className="bg-[#1a1a1a] text-white/90">Oldest First</option>
                        <option value="filename-asc" className="bg-[#1a1a1a] text-white/90">Name A-Z</option>
                        <option value="filename-desc" className="bg-[#1a1a1a] text-white/90">Name Z-A</option>
                        <option value="size-desc" className="bg-[#1a1a1a] text-white/90">Largest First</option>
                        <option value="size-asc" className="bg-[#1a1a1a] text-white/90">Smallest First</option>
                        <option value="duration-desc" className="bg-[#1a1a1a] text-white/90">Longest First</option>
                        <option value="duration-asc" className="bg-[#1a1a1a] text-white/90">Shortest First</option>
                    </select>
                </div>
            </div>

            {/* Animated Library Management Panel */}
            <div className={`overflow-hidden border-b border-white/[0.04] bg-white/[0.01] transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${showManagement ? 'max-h-[50vh] overflow-y-auto max-[600px]:max-h-[60vh] max-[480px]:max-h-[70vh]' : 'max-h-0'}`}>
                <div className={`px-10 py-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] delay-100 max-[900px]:px-5 max-[600px]:px-4 max-[480px]:px-3 ${showManagement ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2.5'}`}>
                    {/* Management Actions Grid */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mb-6 max-[1200px]:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] max-[900px]:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] max-[900px]:gap-3 max-[900px]:mb-5 max-md:grid-cols-2 max-md:gap-3 max-[600px]:grid-cols-1 max-[600px]:gap-2.5 max-[600px]:mb-4">
                        {/* Scan & Import Section */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.03] hover:border-white/[0.08] max-md:p-3.5 max-[600px]:p-3 max-[480px]:p-2.5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-4">
                                <FolderPlus size={16} />
                                Scan & Import
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="flex items-center gap-2 px-3.5 py-2.5 border border-white/[0.08] rounded-lg bg-white/[0.04] text-white/80 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] w-full justify-start hover:enabled:bg-white/[0.06] hover:enabled:border-white/[0.12] hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-xs"
                                    onClick={handleAutoScan}
                                    disabled={isScanning}
                                >
                                    <RotateCcw size={14} />
                                    {isScanning ? 'Scanning...' : 'Scan Downloads'}
                                </button>
                                <button
                                    className="flex items-center gap-2 px-3.5 py-2.5 border border-white/[0.08] rounded-lg bg-white/[0.04] text-white/80 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] w-full justify-start hover:enabled:bg-white/[0.06] hover:enabled:border-white/[0.12] hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-xs"
                                    onClick={handleAddFiles}
                                    disabled={isScanning}
                                >
                                    <FolderPlus size={14} />
                                    Add Folder
                                </button>
                            </div>
                        </div>

                        {/* Maintenance Section */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.03] hover:border-white/[0.08] max-md:p-3.5 max-[600px]:p-3 max-[480px]:p-2.5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-4">
                                <Trash2 size={16} />
                                Maintenance
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="flex items-center gap-2 px-3.5 py-2.5 border border-white/[0.08] rounded-lg bg-white/[0.04] text-white/80 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] w-full justify-start hover:enabled:bg-white/[0.06] hover:enabled:border-white/[0.12] hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-xs"
                                    onClick={() => { loadFiles(); loadLibraryStats(); }}
                                    disabled={isLoading}
                                >
                                    <RotateCcw size={14} />
                                    Refresh
                                </button>
                                <button
                                    className="flex items-center gap-2 px-3.5 py-2.5 border border-amber-500/30 rounded-lg bg-white/[0.04] text-amber-500/90 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] w-full justify-start hover:enabled:bg-amber-500/10 hover:enabled:border-amber-500/40 hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-xs"
                                    onClick={async () => { await cleanLibrary(); await loadLibraryStats(); }}
                                    disabled={isScanning}
                                >
                                    <Trash2 size={14} />
                                    Clean Library
                                </button>
                            </div>
                        </div>

                        {/* Reset Section */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.03] hover:border-white/[0.08] max-md:p-3.5 max-[600px]:p-3 max-[480px]:p-2.5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-4">
                                <RotateCcw size={16} />
                                Reset Data
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="flex items-center gap-2 px-3.5 py-2.5 border border-amber-500/30 rounded-lg bg-white/[0.04] text-amber-500/90 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] w-full justify-start hover:enabled:bg-amber-500/10 hover:enabled:border-amber-500/40 hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-xs"
                                    onClick={() => handleLibraryAction('reset-play-counts', 'Reset all play counts? This action cannot be undone.')}
                                    disabled={isLibraryLoading}
                                >
                                    <Play size={14} />
                                    Reset Play Counts
                                </button>
                                <button
                                    className="flex items-center gap-2 px-3.5 py-2.5 border border-amber-500/30 rounded-lg bg-white/[0.04] text-amber-500/90 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] w-full justify-start hover:enabled:bg-amber-500/10 hover:enabled:border-amber-500/40 hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-xs"
                                    onClick={() => handleLibraryAction('reset-favorites', 'Remove all favorites? This action cannot be undone.')}
                                    disabled={isLibraryLoading}
                                >
                                    <Heart size={14} />
                                    Reset Favorites
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-500/[0.02] border border-red-500/20 rounded-xl p-4 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/[0.04] max-md:p-3.5 max-[600px]:p-3 max-[480px]:p-2.5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-500/90 mb-4">
                                <AlertTriangle size={16} />
                                Danger Zone
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="flex items-center gap-2 px-3.5 py-2.5 border border-red-500/30 rounded-lg bg-white/[0.04] text-red-500/90 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] w-full justify-start hover:enabled:bg-red-500/10 hover:enabled:border-red-500/40 hover:enabled:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:px-3 max-[480px]:py-2 max-[480px]:text-xs"
                                    onClick={() => handleLibraryAction('clear', 'Clear entire library? This will remove all files from the library (but not delete the actual files). This action cannot be undone.')}
                                    disabled={isLibraryLoading}
                                >
                                    <AlertTriangle size={14} />
                                    Clear Library
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Library Stats */}
                    {libraryStats && (
                        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl max-md:p-3.5 max-[600px]:p-3 max-[480px]:p-2.5">
                            <div className="text-sm font-semibold text-white/90 mb-4">Library Statistics</div>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4 max-[900px]:grid-cols-[repeat(auto-fit,minmax(90px,1fr))] max-[900px]:gap-2.5 max-[600px]:grid-cols-3 max-[600px]:gap-2 max-[480px]:grid-cols-2 max-[480px]:gap-1.5">
                                <div className="text-center p-3 bg-white/[0.03] rounded-lg max-[600px]:p-2 max-[480px]:p-2">
                                    <span className="block text-lg font-semibold text-blue-500/90 mb-1 max-[600px]:text-base max-[480px]:text-sm">{libraryStats.totalFiles}</span>
                                    <span className="block text-[11px] text-white/60 uppercase tracking-[0.5px] max-[480px]:text-[10px]">Total Files</span>
                                </div>
                                <div className="text-center p-3 bg-white/[0.03] rounded-lg max-[600px]:p-2 max-[480px]:p-2">
                                    <span className="block text-lg font-semibold text-blue-500/90 mb-1 max-[600px]:text-base max-[480px]:text-sm">{libraryStats.videoFiles}</span>
                                    <span className="block text-[11px] text-white/60 uppercase tracking-[0.5px] max-[480px]:text-[10px]">Videos</span>
                                </div>
                                <div className="text-center p-3 bg-white/[0.03] rounded-lg max-[600px]:p-2 max-[480px]:p-2">
                                    <span className="block text-lg font-semibold text-blue-500/90 mb-1 max-[600px]:text-base max-[480px]:text-sm">{libraryStats.audioFiles}</span>
                                    <span className="block text-[11px] text-white/60 uppercase tracking-[0.5px] max-[480px]:text-[10px]">Audio</span>
                                </div>
                                <div className="text-center p-3 bg-white/[0.03] rounded-lg max-[600px]:p-2 max-[480px]:p-2">
                                    <span className="block text-lg font-semibold text-blue-500/90 mb-1 max-[600px]:text-base max-[480px]:text-sm">{formatFileSize(libraryStats.totalSize)}</span>
                                    <span className="block text-[11px] text-white/60 uppercase tracking-[0.5px] max-[480px]:text-[10px]">Total Size</span>
                                </div>
                                <div className="text-center p-3 bg-white/[0.03] rounded-lg max-[600px]:p-2 max-[480px]:p-2">
                                    <span className="block text-lg font-semibold text-blue-500/90 mb-1 max-[600px]:text-base max-[480px]:text-sm">{formatDuration(libraryStats.totalDuration)}</span>
                                    <span className="block text-[11px] text-white/60 uppercase tracking-[0.5px] max-[480px]:text-[10px]">Duration</span>
                                </div>
                                <div className="text-center p-3 bg-white/[0.03] rounded-lg max-[600px]:p-2 max-[480px]:p-2">
                                    <span className="block text-lg font-semibold text-blue-500/90 mb-1 max-[600px]:text-base max-[480px]:text-sm">{libraryStats.favoriteFiles}</span>
                                    <span className="block text-[11px] text-white/60 uppercase tracking-[0.5px] max-[480px]:text-[10px]">Favorites</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Files Grid/List */}
                <div className="flex-1 overflow-y-auto px-10 py-5 scrollbar-panel max-md:px-5 max-md:py-4 max-[480px]:px-4 max-[480px]:py-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-white/60 gap-4">
                            <RotateCcw size={32} className="animate-spin" />
                            <div>Loading library...</div>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center gap-4">
                            <HardDrive size={64} className="text-white/20" />
                            <div className="text-lg font-medium text-white/70">
                                {files.length === 0 ? 'No downloaded files found' : 'No files match your filters'}
                            </div>
                            <div className="text-sm text-white/40 max-w-[400px]">
                                {files.length === 0
                                    ? 'Downloaded files will appear here automatically. You can also scan additional folders.'
                                    : 'Try adjusting your search or filter criteria'
                                }
                            </div>
                            {files.length === 0 && (
                                <button
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-500/15 border border-blue-500/30 rounded-[10px] text-blue-500/90 text-sm font-medium cursor-pointer transition-all duration-200 font-[inherit] mt-2 hover:bg-blue-500/20 hover:border-blue-500/40"
                                    onClick={handleAutoScan}
                                >
                                    <RotateCcw size={16} />
                                    Scan Downloads
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col gap-2">
                            {filteredFiles.map(file => (
                                <FileListItem key={file.id} file={file} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[1000] bg-[rgba(20,20,20,0.95)] backdrop-blur-[20px] border border-white/10 rounded-lg py-2 min-w-[200px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="flex items-center gap-3 w-full px-4 py-2 bg-transparent border-none text-white/80 text-[13px] cursor-pointer transition-colors duration-200 font-[inherit] text-left hover:bg-white/10 hover:text-white/90" onClick={() => handlePlay(contextMenu.file)}>
                        <Play size={14} />
                        Play in OS Player
                    </button>
                    <hr className="my-1 border-none border-t border-white/10" />
                    <button className="flex items-center gap-3 w-full px-4 py-2 bg-transparent border-none text-white/80 text-[13px] cursor-pointer transition-colors duration-200 font-[inherit] text-left hover:bg-white/10 hover:text-white/90" onClick={() => handleToggleFavorite(contextMenu.file)}>
                        {contextMenu.file.favorite ? <HeartOff size={14} /> : <Heart size={14} />}
                        {contextMenu.file.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <hr className="my-1 border-none border-t border-white/10" />
                    <button className="flex items-center gap-3 w-full px-4 py-2 bg-transparent border-none text-white/80 text-[13px] cursor-pointer transition-colors duration-200 font-[inherit] text-left hover:bg-white/10 hover:text-white/90" onClick={() => handleStartRename(contextMenu.file)}>
                        <Edit3 size={14} />
                        Rename
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-2 bg-transparent border-none text-white/80 text-[13px] cursor-pointer transition-colors duration-200 font-[inherit] text-left hover:bg-white/10 hover:text-white/90" onClick={() => handleCopyPath(contextMenu.file)}>
                        <Copy size={14} />
                        Copy Path
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-2 bg-transparent border-none text-white/80 text-[13px] cursor-pointer transition-colors duration-200 font-[inherit] text-left hover:bg-white/10 hover:text-white/90" onClick={() => handleOpenFolder(contextMenu.file)}>
                        <Folder size={14} />
                        Show in Folder
                    </button>
                    <hr className="my-1 border-none border-t border-white/10" />
                    <button className="flex items-center gap-3 w-full px-4 py-2 bg-transparent border-none text-white/80 text-[13px] cursor-pointer transition-colors duration-200 font-[inherit] text-left hover:bg-white/10 hover:text-white/90" onClick={() => handleRemoveFromLibrary(contextMenu.file)}>
                        <Move size={14} />
                        Remove from Library
                    </button>
                    <button
                        onClick={() => handleDelete(contextMenu.file)}
                        className="flex items-center gap-3 w-full px-4 py-2 bg-transparent border-none text-red-500/80 text-[13px] cursor-pointer transition-colors duration-200 font-[inherit] text-left hover:bg-red-500/10 hover:text-red-500/90"
                    >
                        <Trash2 size={14} />
                        Delete File
                    </button>
                </div>
            )}
        </div>
    );
}
