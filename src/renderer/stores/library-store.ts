import { create } from 'zustand';
import { LibraryFile, LibraryFilter, LibrarySort } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

interface LibraryStore {
    // State
    files: LibraryFile[];
    filteredFiles: LibraryFile[];
    isLoading: boolean;
    isScanning: boolean;
    filter: LibraryFilter;
    sort: LibrarySort;
    selectedFiles: Set<string>;

    // Actions
    loadFiles: () => Promise<void>;
    scanDirectory: (path: string) => Promise<void>;
    scanDownloadPaths: (paths: string[]) => Promise<void>;
    addFile: (filePath: string) => Promise<void>;
    removeFile: (fileId: string) => Promise<void>;
    updateFile: (fileId: string, updates: Partial<LibraryFile>) => Promise<void>;
    deleteFile: (fileId: string) => Promise<void>;
    renameFile: (fileId: string, newName: string) => Promise<void>;
    moveFile: (fileId: string, newPath: string) => Promise<void>;
    copyPath: (fileId: string) => Promise<void>;
    generateThumbnail: (fileId: string) => Promise<void>;
    cleanLibrary: () => Promise<void>;
    
    
    // Filter and sort actions
    setFilter: (filter: Partial<LibraryFilter>) => void;
    setSort: (sort: LibrarySort) => void;
    applyFiltersAndSort: () => void;
    
    // Selection actions
    selectFile: (fileId: string) => void;
    deselectFile: (fileId: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    toggleSelection: (fileId: string) => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
    // Initial state
    files: [],
    filteredFiles: [],
    isLoading: false,
    isScanning: false,
    filter: {
        search: '',
        type: 'all',
        favorite: false,
        tags: []
    },
    sort: {
        field: 'addedAt',
        order: 'desc'
    },
    selectedFiles: new Set(),

    // File management actions
    loadFiles: async () => {
        set({ isLoading: true });
        try {
            const files = await window.electron.invoke(IPC_CHANNELS.LIBRARY_GET_FILES);
            set({ files });
            get().applyFiltersAndSort();
        } catch (error) {
            console.error('Failed to load library files:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    scanDirectory: async (path: string) => {
        set({ isScanning: true });
        try {
            const newFiles = await window.electron.invoke(IPC_CHANNELS.LIBRARY_SCAN, path);
            if (newFiles.length > 0) {
                await get().loadFiles(); // Reload all files
            }
        } catch (error) {
            console.error('Failed to scan directory:', error);
        } finally {
            set({ isScanning: false });
        }
    },

    scanDownloadPaths: async (paths: string[]) => {
        set({ isScanning: true });
        try {
            const newFiles = await window.electron.invoke('library:scan-download-paths', paths);
            if (newFiles.length > 0) {
                await get().loadFiles(); // Reload all files
            }
        } catch (error) {
            console.error('Failed to scan download paths:', error);
        } finally {
            set({ isScanning: false });
        }
    },


    addFile: async (filePath: string) => {
        try {
            const newFile = await window.electron.invoke(IPC_CHANNELS.LIBRARY_ADD_FILE, filePath);
            if (newFile) {
                set(state => ({ files: [...state.files, newFile] }));
                get().applyFiltersAndSort();
            }
        } catch (error) {
            console.error('Failed to add file:', error);
        }
    },

    removeFile: async (fileId: string) => {
        try {
            const success = await window.electron.invoke(IPC_CHANNELS.LIBRARY_REMOVE_FILE, fileId);
            if (success) {
                set(state => ({
                    files: state.files.filter(f => f.id !== fileId),
                    selectedFiles: new Set([...state.selectedFiles].filter(id => id !== fileId))
                }));
                get().applyFiltersAndSort();
            }
        } catch (error) {
            console.error('Failed to remove file:', error);
        }
    },

    updateFile: async (fileId: string, updates: Partial<LibraryFile>) => {
        try {
            const updatedFile = await window.electron.invoke(IPC_CHANNELS.LIBRARY_UPDATE_FILE, fileId, updates);
            if (updatedFile) {
                set(state => ({
                    files: state.files.map(f => f.id === fileId ? updatedFile : f)
                }));
                get().applyFiltersAndSort();
            }
        } catch (error) {
            console.error('Failed to update file:', error);
        }
    },

    deleteFile: async (fileId: string) => {
        try {
            const success = await window.electron.invoke(IPC_CHANNELS.LIBRARY_DELETE_FILE, fileId);
            if (success) {
                set(state => ({
                    files: state.files.filter(f => f.id !== fileId),
                    selectedFiles: new Set([...state.selectedFiles].filter(id => id !== fileId))
                }));
                get().applyFiltersAndSort();
            }
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    },

    renameFile: async (fileId: string, newName: string) => {
        try {
            const success = await window.electron.invoke(IPC_CHANNELS.LIBRARY_RENAME_FILE, fileId, newName);
            if (success) {
                set(state => ({
                    files: state.files.map(f => 
                        f.id === fileId ? { ...f, filename: newName } : f
                    )
                }));
                get().applyFiltersAndSort();
            }
        } catch (error) {
            console.error('Failed to rename file:', error);
        }
    },

    moveFile: async (fileId: string, newPath: string) => {
        try {
            const success = await window.electron.invoke(IPC_CHANNELS.LIBRARY_MOVE_FILE, fileId, newPath);
            if (success) {
                // Reload files to get updated path
                await get().loadFiles();
            }
        } catch (error) {
            console.error('Failed to move file:', error);
        }
    },

    copyPath: async (fileId: string) => {
        try {
            await window.electron.invoke(IPC_CHANNELS.LIBRARY_COPY_PATH, fileId);
        } catch (error) {
            console.error('Failed to copy path:', error);
        }
    },

    generateThumbnail: async (fileId: string) => {
        try {
            const thumbnailPath = await window.electron.invoke(IPC_CHANNELS.LIBRARY_GENERATE_THUMBNAIL, fileId);
            if (thumbnailPath) {
                set(state => ({
                    files: state.files.map(f => 
                        f.id === fileId ? { ...f, thumbnail: thumbnailPath } : f
                    )
                }));
                get().applyFiltersAndSort();
            }
        } catch (error) {
            console.error('Failed to generate thumbnail:', error);
        }
    },

    cleanLibrary: async () => {
        try {
            const removedCount = await window.electron.invoke(IPC_CHANNELS.LIBRARY_CLEAN);
            if (removedCount > 0) {
                await get().loadFiles(); // Reload files after cleanup
                console.log(`Cleaned ${removedCount} invalid files from library`);
            }
        } catch (error) {
            console.error('Failed to clean library:', error);
        }
    },


    // Filter and sort actions
    setFilter: (newFilter: Partial<LibraryFilter>) => {
        set(state => ({
            filter: { ...state.filter, ...newFilter }
        }));
        get().applyFiltersAndSort();
    },

    setSort: (sort: LibrarySort) => {
        set({ sort });
        get().applyFiltersAndSort();
    },

    applyFiltersAndSort: () => {
        const { files, filter, sort } = get();
        
        let filtered = [...files];
        
        // Apply search filter with regex support
        if (filter.search) {
            try {
                // Try to use as regex first
                const regex = new RegExp(filter.search, 'i');
                filtered = filtered.filter(file => 
                    regex.test(file.filename) ||
                    file.tags.some(tag => regex.test(tag))
                );
            } catch (error) {
                // If regex is invalid, fall back to simple string search
                const searchLower = filter.search.toLowerCase();
                filtered = filtered.filter(file => 
                    file.filename.toLowerCase().includes(searchLower) ||
                    file.tags.some(tag => tag.toLowerCase().includes(searchLower))
                );
            }
        }
        
        // Apply type filter
        if (filter.type !== 'all') {
            filtered = filtered.filter(file => file.type === filter.type);
        }
        
        // Apply favorite filter
        if (filter.favorite) {
            filtered = filtered.filter(file => file.favorite);
        }
        
        // Apply tag filter
        if (filter.tags.length > 0) {
            filtered = filtered.filter(file => 
                filter.tags.some(tag => file.tags.includes(tag))
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any = a[sort.field];
            let bValue: any = b[sort.field];
            
            // Handle different data types
            if (sort.field === 'addedAt' || sort.field === 'lastPlayed') {
                aValue = new Date(aValue || 0).getTime();
                bValue = new Date(bValue || 0).getTime();
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return sort.order === 'asc' ? -1 : 1;
            if (aValue > bValue) return sort.order === 'asc' ? 1 : -1;
            return 0;
        });
        
        set({ filteredFiles: filtered });
    },

    // Selection actions
    selectFile: (fileId: string) => {
        set(state => ({
            selectedFiles: new Set([...state.selectedFiles, fileId])
        }));
    },

    deselectFile: (fileId: string) => {
        set(state => {
            const newSelection = new Set(state.selectedFiles);
            newSelection.delete(fileId);
            return { selectedFiles: newSelection };
        });
    },

    selectAll: () => {
        set(state => ({
            selectedFiles: new Set(state.filteredFiles.map(f => f.id))
        }));
    },

    clearSelection: () => {
        set({ selectedFiles: new Set() });
    },

    toggleSelection: (fileId: string) => {
        const { selectedFiles } = get();
        if (selectedFiles.has(fileId)) {
            get().deselectFile(fileId);
        } else {
            get().selectFile(fileId);
        }
    }
}));