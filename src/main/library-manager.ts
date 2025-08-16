import { app, shell, clipboard } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import { LibraryFile, FileStats } from '../shared/types';

export class LibraryManager {
    private libraryDir: string;
    private dbPath: string;
    private files: Map<string, LibraryFile> = new Map();

    constructor() {
        const userDataPath = app.getPath('userData');
        this.libraryDir = path.join(userDataPath, 'library');
        this.dbPath = path.join(this.libraryDir, 'library.json');
        this.ensureDirectories();
        this.loadLibrary();
    }

    private async ensureDirectories(): Promise<void> {
        await fs.mkdir(this.libraryDir, { recursive: true });
    }

    private async loadLibrary(): Promise<void> {
        try {
            const data = await fs.readFile(this.dbPath, 'utf-8');
            const libraryData = JSON.parse(data) as LibraryFile[];
            this.files.clear();
            
            let removedCount = 0;
            
            // Verify files still exist and are media files
            for (const file of libraryData) {
                try {
                    await fs.access(file.path);
                    
                    // Check if file is actually a media file
                    const extension = this.getFileExtension(file.filename);
                    if (this.isMediaFile(extension)) {
                        this.files.set(file.id, file);
                    } else {
                        console.log(`Removing non-media file from library: ${file.filename}`);
                        removedCount++;
                    }
                } catch {
                    // File no longer exists, skip it
                    console.log(`File no longer exists: ${file.path}`);
                    removedCount++;
                }
            }
            
            // Save cleaned library if any files were removed
            if (removedCount > 0) {
                console.log(`Cleaned ${removedCount} invalid files from library`);
                await this.saveLibrary();
            }
        } catch (error) {
            // Library file doesn't exist yet, start with empty library
            console.log('No existing library found, starting fresh');
        }
    }

    private async saveLibrary(): Promise<void> {
        try {
            const libraryData = Array.from(this.files.values());
            await fs.writeFile(this.dbPath, JSON.stringify(libraryData, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save library:', error);
        }
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private getFileExtension(filename: string): string {
        return path.extname(filename).toLowerCase().slice(1);
    }

    private getFileType(extension: string): 'video' | 'audio' | null {
        // Only allow known video and audio extensions
        const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'ts', '3gp', 'f4v', 'mpg', 'mpeg', 'ogv'];
        const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus', 'aiff', 'alac', 'ac3', 'dts'];
        
        console.log(`Checking file extension: "${extension}"`);
        
        if (videoExtensions.includes(extension)) {
            console.log(`✓ Valid video file: ${extension}`);
            return 'video';
        }
        if (audioExtensions.includes(extension)) {
            console.log(`✓ Valid audio file: ${extension}`);
            return 'audio';
        }
        
        // Log rejected files for debugging
        console.log(`✗ Rejected non-media file: ${extension}`);
        return null; // Not a media file
    }

    private isMediaFile(extension: string): boolean {
        if (!extension || extension.trim() === '') {
            console.log('✗ Empty or invalid extension');
            return false;
        }
        
        const result = this.getFileType(extension) !== null;
        console.log(`File extension "${extension}" is ${result ? 'ACCEPTED' : 'REJECTED'}`);
        return result;
    }

    async scanDownloadPaths(downloadPaths: string[]): Promise<LibraryFile[]> {
        const newFiles: LibraryFile[] = [];
        
        for (const downloadPath of downloadPaths) {
            try {
                // Check if path exists
                await fs.access(downloadPath);
                const pathFiles = await this.scanDirectory(downloadPath);
                newFiles.push(...pathFiles);
            } catch (error) {
                console.log(`Download path not accessible: ${downloadPath}`);
            }
        }
        
        return newFiles;
    }

    async scanDirectory(directoryPath: string): Promise<LibraryFile[]> {
        const newFiles: LibraryFile[] = [];
        
        try {
            const items = await fs.readdir(directoryPath, { withFileTypes: true });
            
            for (const item of items) {
                if (item.isFile()) {
                    const filePath = path.join(directoryPath, item.name);
                    const extension = this.getFileExtension(item.name);
                    
                    // Only process media files
                    if (this.isMediaFile(extension)) {
                        const type = this.getFileType(extension);
                        if (!type) continue; // Skip non-media files
                        
                        // Verify file exists before processing
                        try {
                            await fs.access(filePath);
                        } catch {
                            console.log(`File not accessible: ${filePath}`);
                            continue;
                        }
                        // Check if file is already in library
                        const existingFile = Array.from(this.files.values())
                            .find(f => f.path === filePath);
                        
                        if (!existingFile) {
                            const stats = await fs.stat(filePath);
                            const fileStats = await this.getFileStats(filePath);
                            
                            const libraryFile: LibraryFile = {
                                id: this.generateId(),
                                filename: item.name,
                                path: filePath,
                                type,
                                format: extension,
                                size: stats.size,
                                duration: fileStats.duration,
                                width: fileStats.width,
                                height: fileStats.height,
                                createdAt: stats.birthtime.toISOString(),
                                addedAt: new Date().toISOString(),
                                tags: [],
                                favorite: false,
                                playCount: 0
                            };
                            
                            this.files.set(libraryFile.id, libraryFile);
                            newFiles.push(libraryFile);
                        }
                    }
                } else if (item.isDirectory()) {
                    // Recursively scan subdirectories
                    const subDirFiles = await this.scanDirectory(path.join(directoryPath, item.name));
                    newFiles.push(...subDirFiles);
                }
            }
        } catch (error) {
            console.error(`Failed to scan directory ${directoryPath}:`, error);
        }
        
        if (newFiles.length > 0) {
            await this.saveLibrary();
        }
        
        return newFiles;
    }


    async getFiles(): Promise<LibraryFile[]> {
        return Array.from(this.files.values());
    }

    async cleanLibrary(): Promise<number> {
        let removedCount = 0;
        const filesToRemove: string[] = [];
        
        for (const [id, file] of this.files) {
            try {
                // Check if file still exists
                await fs.access(file.path);
                
                // Check if file is a media file
                const extension = this.getFileExtension(file.filename);
                if (!this.isMediaFile(extension)) {
                    console.log(`Marking non-media file for removal: ${file.filename}`);
                    filesToRemove.push(id);
                    removedCount++;
                }
            } catch {
                // File no longer exists
                console.log(`Marking non-existent file for removal: ${file.filename}`);
                filesToRemove.push(id);
                removedCount++;
            }
        }
        
        // Remove invalid files
        for (const id of filesToRemove) {
            this.files.delete(id);
        }
        
        if (removedCount > 0) {
            await this.saveLibrary();
            console.log(`Cleaned ${removedCount} invalid files from library`);
        }
        
        return removedCount;
    }

    async resetPlayCounts(): Promise<number> {
        let updatedCount = 0;
        
        for (const [id, file] of this.files) {
            if (file.playCount > 0 || file.lastPlayed) {
                const updatedFile = {
                    ...file,
                    playCount: 0,
                    lastPlayed: undefined
                };
                this.files.set(id, updatedFile);
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            await this.saveLibrary();
            console.log(`Reset play counts for ${updatedCount} files`);
        }
        
        return updatedCount;
    }

    async resetFavorites(): Promise<number> {
        let updatedCount = 0;
        
        for (const [id, file] of this.files) {
            if (file.favorite) {
                const updatedFile = {
                    ...file,
                    favorite: false
                };
                this.files.set(id, updatedFile);
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            await this.saveLibrary();
            console.log(`Reset favorites for ${updatedCount} files`);
        }
        
        return updatedCount;
    }

    async clearLibrary(): Promise<number> {
        const fileCount = this.files.size;
        this.files.clear();
        
        if (fileCount > 0) {
            await this.saveLibrary();
            console.log(`Cleared entire library (${fileCount} files)`);
        }
        
        return fileCount;
    }

    async getLibraryStats(): Promise<{
        totalFiles: number;
        videoFiles: number;
        audioFiles: number;
        totalSize: number;
        totalDuration: number;
        favoriteFiles: number;
        playedFiles: number;
        totalPlayCount: number;
    }> {
        const files = Array.from(this.files.values());
        
        return {
            totalFiles: files.length,
            videoFiles: files.filter(f => f.type === 'video').length,
            audioFiles: files.filter(f => f.type === 'audio').length,
            totalSize: files.reduce((sum, f) => sum + f.size, 0),
            totalDuration: files.reduce((sum, f) => sum + (f.duration || 0), 0),
            favoriteFiles: files.filter(f => f.favorite).length,
            playedFiles: files.filter(f => f.playCount > 0).length,
            totalPlayCount: files.reduce((sum, f) => sum + f.playCount, 0)
        };
    }

    async addFile(filePath: string): Promise<LibraryFile | null> {
        try {
            // Verify file exists
            await fs.access(filePath);
            
            const stats = await fs.stat(filePath);
            const filename = path.basename(filePath);
            const extension = this.getFileExtension(filename);
            const type = this.getFileType(extension);
            
            // Only allow media files
            if (!type) {
                console.log(`Skipping non-media file: ${filename}`);
                return null;
            }
            
            // Check if file is already in library
            const existingFile = Array.from(this.files.values())
                .find(f => f.path === filePath);
            
            if (existingFile) {
                return existingFile;
            }
            
            const fileStats = await this.getFileStats(filePath);
            
            const libraryFile: LibraryFile = {
                id: this.generateId(),
                filename,
                path: filePath,
                type,
                format: extension,
                size: stats.size,
                duration: fileStats.duration,
                width: fileStats.width,
                height: fileStats.height,
                createdAt: stats.birthtime.toISOString(),
                addedAt: new Date().toISOString(),
                tags: [],
                favorite: false,
                playCount: 0
            };
            
            this.files.set(libraryFile.id, libraryFile);
            await this.saveLibrary();
            
            return libraryFile;
        } catch (error) {
            console.error('Failed to add file to library:', error);
            return null;
        }
    }

    async removeFile(fileId: string): Promise<boolean> {
        if (this.files.has(fileId)) {
            this.files.delete(fileId);
            await this.saveLibrary();
            return true;
        }
        return false;
    }

    async updateFile(fileId: string, updates: Partial<LibraryFile>): Promise<LibraryFile | null> {
        const file = this.files.get(fileId);
        if (!file) return null;
        
        const updatedFile = { ...file, ...updates };
        this.files.set(fileId, updatedFile);
        await this.saveLibrary();
        
        return updatedFile;
    }

    async moveFile(fileId: string, newPath: string): Promise<boolean> {
        const file = this.files.get(fileId);
        if (!file) return false;
        
        try {
            await fs.rename(file.path, newPath);
            
            const updatedFile = {
                ...file,
                path: newPath,
                filename: path.basename(newPath)
            };
            
            this.files.set(fileId, updatedFile);
            await this.saveLibrary();
            
            return true;
        } catch (error) {
            console.error('Failed to move file:', error);
            return false;
        }
    }

    async deleteFile(fileId: string): Promise<boolean> {
        const file = this.files.get(fileId);
        if (!file) return false;
        
        try {
            await fs.unlink(file.path);
            this.files.delete(fileId);
            await this.saveLibrary();
            return true;
        } catch (error) {
            console.error('Failed to delete file:', error);
            return false;
        }
    }

    async renameFile(fileId: string, newName: string): Promise<boolean> {
        const file = this.files.get(fileId);
        if (!file) return false;
        
        const newPath = path.join(path.dirname(file.path), newName);
        
        try {
            await fs.rename(file.path, newPath);
            
            const updatedFile = {
                ...file,
                path: newPath,
                filename: newName
            };
            
            this.files.set(fileId, updatedFile);
            await this.saveLibrary();
            
            return true;
        } catch (error) {
            console.error('Failed to rename file:', error);
            return false;
        }
    }

    async copyPath(fileId: string): Promise<boolean> {
        const file = this.files.get(fileId);
        if (!file) return false;
        
        try {
            clipboard.writeText(file.path);
            return true;
        } catch (error) {
            console.error('Failed to copy path:', error);
            return false;
        }
    }

    async generateThumbnail(fileId: string): Promise<string | null> {
        const file = this.files.get(fileId);
        if (!file || file.type !== 'video') return null;
        
        try {
            // Verify source file exists
            await fs.access(file.path);
        } catch {
            console.log(`Source file not found for thumbnail: ${file.path}`);
            return null;
        }
        
        const thumbnailsDir = path.join(this.libraryDir, 'thumbnails');
        await fs.mkdir(thumbnailsDir, { recursive: true });
        
        const thumbnailPath = path.join(thumbnailsDir, `${file.id}.jpg`);
        
        // Check if thumbnail already exists
        try {
            await fs.access(thumbnailPath);
            console.log(`Thumbnail already exists: ${thumbnailPath}`);
            
            // Update file with thumbnail path if not already set
            if (!file.thumbnail) {
                const updatedFile = { ...file, thumbnail: thumbnailPath };
                this.files.set(fileId, updatedFile);
                await this.saveLibrary();
            }
            return thumbnailPath;
        } catch {
            // Thumbnail doesn't exist, generate it
        }
        
        return new Promise((resolve) => {
            console.log(`Generating thumbnail for: ${file.path}`);
            
            // Use FFmpeg to generate thumbnail with better error handling
            const ffmpeg = spawn('ffmpeg', [
                '-i', file.path,
                '-ss', '00:00:05', // Skip 5 seconds to avoid black frames
                '-vframes', '1',
                '-vf', 'scale=320:240:force_original_aspect_ratio=decrease', // Scale thumbnail
                '-f', 'image2',
                '-q:v', '2', // High quality
                '-y',
                thumbnailPath
            ]);
            
            let errorOutput = '';
            
            ffmpeg.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            ffmpeg.on('close', async (code) => {
                if (code === 0) {
                    try {
                        // Verify thumbnail was created
                        await fs.access(thumbnailPath);
                        console.log(`Thumbnail generated successfully: ${thumbnailPath}`);
                        
                        // Update file with thumbnail path
                        const updatedFile = { ...file, thumbnail: thumbnailPath };
                        this.files.set(fileId, updatedFile);
                        await this.saveLibrary();
                        resolve(thumbnailPath);
                    } catch {
                        console.log(`Thumbnail file not created: ${thumbnailPath}`);
                        resolve(null);
                    }
                } else {
                    console.error(`FFmpeg failed with code ${code}:`, errorOutput);
                    resolve(null);
                }
            });
            
            ffmpeg.on('error', (error) => {
                console.error('FFmpeg error:', error);
                resolve(null);
            });
        });
    }

    async getFileStats(filePath: string): Promise<FileStats> {
        return new Promise((resolve) => {
            const stats: FileStats = {
                size: 0,
                format: path.extname(filePath).slice(1),
                createdAt: new Date().toISOString()
            };
            
            // Use FFprobe to get media information
            const ffprobe = spawn('ffprobe', [
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                filePath
            ]);
            
            let output = '';
            
            ffprobe.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            ffprobe.on('close', (code) => {
                if (code === 0) {
                    try {
                        const info = JSON.parse(output);
                        
                        if (info.format) {
                            stats.duration = parseFloat(info.format.duration) || undefined;
                            stats.size = parseInt(info.format.size) || 0;
                            stats.bitrate = parseInt(info.format.bit_rate) || undefined;
                        }
                        
                        // Get video dimensions from first video stream
                        const videoStream = info.streams?.find((s: any) => s.codec_type === 'video');
                        if (videoStream) {
                            stats.width = videoStream.width;
                            stats.height = videoStream.height;
                        }
                    } catch (error) {
                        console.error('Failed to parse FFprobe output:', error);
                    }
                }
                
                resolve(stats);
            });
            
            ffprobe.on('error', () => {
                resolve(stats);
            });
        });
    }
}