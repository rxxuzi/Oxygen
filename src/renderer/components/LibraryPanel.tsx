import React, { useEffect, useState } from 'react';
import { useLibraryStore } from '../stores/library-store';
import { LibraryFile } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import {
    FolderPlus,
    Search,
    Play,
    MoreVertical,
    Heart,
    HeartOff,
    Folder,
    Copy,
    Trash2,
    Edit3,
    Move,
    RotateCcw,
    Filter,
    SortAsc,
    SortDesc,
    Video,
    Music,
    Clock,
    Calendar,
    HardDrive,
    Tag,
    Database,
    AlertTriangle
} from 'lucide-react';
import '../styles/library.css';

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
        addFile,
        removeFile,
        updateFile,
        deleteFile,
        renameFile,
        copyPath,
        generateThumbnail,
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
            className={`modern-list-item ${selectedFiles.has(file.id) ? 'selected' : ''}`}
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
            <div className="modern-list-preview">
                {file.thumbnail ? (
                    <img 
                        src={`file:///${file.thumbnail.replace(/\\/g, '/')}`} 
                        alt={file.filename}
                        className="modern-list-thumbnail"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                                parent.classList.add('thumbnail-error');
                            }
                        }}
                    />
                ) : (
                    <div className="modern-list-icon">
                        {file.type === 'video' ? <Video size={24} /> : <Music size={24} />}
                    </div>
                )}
            </div>
            
            {/* File Info */}
            <div className="modern-list-info">
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
                        className="modern-list-name-input"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="modern-list-name" title={file.filename}>
                        {file.filename}
                    </div>
                )}
                <div className="modern-list-details">
                    <span className="detail-item">{file.format.toUpperCase()}</span>
                    <span className="detail-separator">•</span>
                    <span className="detail-item">{formatFileSize(file.size)}</span>
                    {file.width && file.height && (
                        <>
                            <span className="detail-separator">•</span>
                            <span className="detail-item">{file.width}×{file.height}</span>
                        </>
                    )}
                    {file.duration && (
                        <>
                            <span className="detail-separator">•</span>
                            <span className="detail-item">{formatDurationDisplay(file.duration)}</span>
                        </>
                    )}
                </div>
            </div>
            
            {/* Badges */}
            <div className="modern-list-badges">
                {file.favorite && (
                    <div className="modern-list-badge favorite">
                        <Heart size={12} fill="currentColor" />
                    </div>
                )}
                {file.playCount > 0 && (
                    <div className="modern-list-badge play-count">
                        ▶ {file.playCount}
                    </div>
                )}
            </div>
            
            {/* Date - hidden on small screens */}
            <div className="modern-list-date modern-list-date-desktop">
                {new Date(file.addedAt).toLocaleDateString()}
            </div>
            
            {/* Actions */}
            <div className="modern-list-actions">
                <button 
                    className="modern-list-play-btn"
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
        <div className="library-container">
            {/* Header */}
            <div className="library-header">
                <div className="library-header-left">
                    <div className="library-title">
                        <HardDrive size={24} />
                        Library
                    </div>
                    <div className="library-stats">
                        {files.length} files • {filteredFiles.length} shown
                    </div>
                </div>
                
                <div className="library-header-right">
                    <button 
                        className={`library-btn library-manage-btn ${showManagement ? 'active' : ''}`}
                        onClick={() => setShowManagement(!showManagement)}
                    >
                        <Database size={16} />
                        Manage
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="library-filters">
                <div className="library-search">
                    <Search size={16} className="library-search-icon" />
                    <input
                        type="text"
                        placeholder="Search files... (regex supported: .*\.mp4$ or ^video.*)"
                        value={filter.search}
                        onChange={(e) => setFilter({ search: e.target.value })}
                        className={`library-search-input ${searchMode === 'regex' ? 'regex-mode' : ''}`}
                        title="Supports regular expressions. Examples: .*\.mp4$ (files ending with .mp4), ^video.* (files starting with 'video')"
                    />
                    {searchMode === 'regex' && filter.search && (
                        <div className="search-mode-indicator">
                            <span className="regex-badge">REGEX</span>
                        </div>
                    )}
                </div>
                
                <div className="library-filter-controls">
                    <select 
                        value={filter.type}
                        onChange={(e) => setFilter({ type: e.target.value as any })}
                        className="library-filter-select"
                    >
                        <option value="all">All Files</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                    </select>
                    
                    <button 
                        className={`library-filter-btn ${filter.favorite ? 'active' : ''}`}
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
                        className="library-sort-select"
                    >
                        <option value="addedAt-desc">Recently Added</option>
                        <option value="addedAt-asc">Oldest First</option>
                        <option value="filename-asc">Name A-Z</option>
                        <option value="filename-desc">Name Z-A</option>
                        <option value="size-desc">Largest First</option>
                        <option value="size-asc">Smallest First</option>
                        <option value="duration-desc">Longest First</option>
                        <option value="duration-asc">Shortest First</option>
                    </select>
                    
                </div>
            </div>

            {/* Animated Library Management Panel */}
            <div className={`library-management-panel ${showManagement ? 'open' : ''}`}>
                <div className="library-management-content">
                    {/* Management Actions Grid */}
                    <div className="management-grid">
                        {/* Scan & Import Section */}
                        <div className="management-section">
                            <div className="management-section-title">
                                <FolderPlus size={16} />
                                Scan & Import
                            </div>
                            <div className="management-section-actions">
                                <button 
                                    className="management-action-btn"
                                    onClick={handleAutoScan}
                                    disabled={isScanning}
                                >
                                    <RotateCcw size={14} />
                                    {isScanning ? 'Scanning...' : 'Scan Downloads'}
                                </button>
                                <button 
                                    className="management-action-btn"
                                    onClick={handleAddFiles}
                                    disabled={isScanning}
                                >
                                    <FolderPlus size={14} />
                                    Add Folder
                                </button>
                            </div>
                        </div>

                        {/* Maintenance Section */}
                        <div className="management-section">
                            <div className="management-section-title">
                                <Trash2 size={16} />
                                Maintenance
                            </div>
                            <div className="management-section-actions">
                                <button 
                                    className="management-action-btn"
                                    onClick={() => { loadFiles(); loadLibraryStats(); }}
                                    disabled={isLoading}
                                >
                                    <RotateCcw size={14} />
                                    Refresh
                                </button>
                                <button 
                                    className="management-action-btn warning"
                                    onClick={async () => { await cleanLibrary(); await loadLibraryStats(); }}
                                    disabled={isScanning}
                                >
                                    <Trash2 size={14} />
                                    Clean Library
                                </button>
                            </div>
                        </div>

                        {/* Reset Section */}
                        <div className="management-section">
                            <div className="management-section-title">
                                <RotateCcw size={16} />
                                Reset Data
                            </div>
                            <div className="management-section-actions">
                                <button 
                                    className="management-action-btn warning"
                                    onClick={() => handleLibraryAction('reset-play-counts', 'Reset all play counts? This action cannot be undone.')}
                                    disabled={isLibraryLoading}
                                >
                                    <Play size={14} />
                                    Reset Play Counts
                                </button>
                                <button 
                                    className="management-action-btn warning"
                                    onClick={() => handleLibraryAction('reset-favorites', 'Remove all favorites? This action cannot be undone.')}
                                    disabled={isLibraryLoading}
                                >
                                    <Heart size={14} />
                                    Reset Favorites
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="management-section danger-zone">
                            <div className="management-section-title">
                                <AlertTriangle size={16} />
                                Danger Zone
                            </div>
                            <div className="management-section-actions">
                                <button 
                                    className="management-action-btn danger"
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
                        <div className="management-stats">
                            <div className="management-stats-title">Library Statistics</div>
                            <div className="management-stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">{libraryStats.totalFiles}</span>
                                    <span className="stat-label">Total Files</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{libraryStats.videoFiles}</span>
                                    <span className="stat-label">Videos</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{libraryStats.audioFiles}</span>
                                    <span className="stat-label">Audio</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{formatFileSize(libraryStats.totalSize)}</span>
                                    <span className="stat-label">Total Size</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{formatDuration(libraryStats.totalDuration)}</span>
                                    <span className="stat-label">Duration</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{libraryStats.favoriteFiles}</span>
                                    <span className="stat-label">Favorites</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="library-content">
                {/* Files Grid/List */}
                <div className="library-files-section">
                    {isLoading ? (
                        <div className="library-loading">
                            <RotateCcw size={32} className="library-loading-icon" />
                            <div>Loading library...</div>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="library-empty">
                            <HardDrive size={64} className="library-empty-icon" />
                            <div className="library-empty-title">
                                {files.length === 0 ? 'No downloaded files found' : 'No files match your filters'}
                            </div>
                            <div className="library-empty-description">
                                {files.length === 0 
                                    ? 'Downloaded files will appear here automatically. You can also scan additional folders.'
                                    : 'Try adjusting your search or filter criteria'
                                }
                            </div>
                            {files.length === 0 && (
                                <button 
                                    className="library-empty-btn"
                                    onClick={handleAutoScan}
                                >
                                    <RotateCcw size={16} />
                                    Scan Downloads
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="modern-files-container modern-list-view">
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
                    className="library-context-menu"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => handlePlay(contextMenu.file)}>
                        <Play size={14} />
                        Play in OS Player
                    </button>
                    <hr />
                    <button onClick={() => handleToggleFavorite(contextMenu.file)}>
                        {contextMenu.file.favorite ? <HeartOff size={14} /> : <Heart size={14} />}
                        {contextMenu.file.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <hr />
                    <button onClick={() => handleStartRename(contextMenu.file)}>
                        <Edit3 size={14} />
                        Rename
                    </button>
                    <button onClick={() => handleCopyPath(contextMenu.file)}>
                        <Copy size={14} />
                        Copy Path
                    </button>
                    <button onClick={() => handleOpenFolder(contextMenu.file)}>
                        <Folder size={14} />
                        Show in Folder
                    </button>
                    <hr />
                    <button onClick={() => handleRemoveFromLibrary(contextMenu.file)}>
                        <Move size={14} />
                        Remove from Library
                    </button>
                    <button 
                        onClick={() => handleDelete(contextMenu.file)}
                        className="library-context-menu-danger"
                    >
                        <Trash2 size={14} />
                        Delete File
                    </button>
                </div>
            )}
        </div>
    );
}