import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { LogEntry } from '../shared/types';

export class FileManager {
    private logsDir: string;

    constructor() {
        const userDataPath = app.getPath('userData');
        this.logsDir = path.join(userDataPath, 'logs');
        this.ensureDirectories();
    }

    private async ensureDirectories(): Promise<void> {
        await fs.mkdir(this.logsDir, { recursive: true });
    }

    async saveDownloadLog(log: LogEntry): Promise<void> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `download-${timestamp}.json`;
            const filepath = path.join(this.logsDir, filename);

            await fs.writeFile(filepath, JSON.stringify(log, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save download log:', error);
        }
    }

    async loadLogs(): Promise<LogEntry[]> {
        try {
            const files = await fs.readdir(this.logsDir);
            const logFiles = files.filter(f => f.startsWith('download-') && f.endsWith('.json'));

            const logs: LogEntry[] = [];

            for (const file of logFiles) {
                try {
                    const content = await fs.readFile(path.join(this.logsDir, file), 'utf-8');
                    const log = JSON.parse(content) as LogEntry;
                    logs.push(log);
                } catch (error) {
                    console.error(`Failed to load log file ${file}:`, error);
                }
            }

            // Sort by date, newest first
            logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return logs;
        } catch (error) {
            console.error('Failed to load logs:', error);
            return [];
        }
    }

    async clearLogs(): Promise<boolean> {
        try {
            const files = await fs.readdir(this.logsDir);
            const logFiles = files.filter(f => f.startsWith('download-') && f.endsWith('.json'));

            for (const file of logFiles) {
                await fs.unlink(path.join(this.logsDir, file));
            }

            return true;
        } catch (error) {
            console.error('Failed to clear logs:', error);
            return false;
        }
    }

    getLogsPath(): string {
        return this.logsDir;
    }

    async ensureOutputDirectory(outputPath: string): Promise<void> {
        await fs.mkdir(outputPath, { recursive: true });
    }
}