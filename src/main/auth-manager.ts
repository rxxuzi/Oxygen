import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { AuthEntry, AuthData } from '../shared/types';

export class AuthManager {
    private authDir: string;
    private cookiesDir: string;
    private authFile: string;
    private passFile: string;

    constructor() {
        const userDataPath = app.getPath('userData');
        this.authDir = path.join(userDataPath, 'auth');
        this.cookiesDir = path.join(this.authDir, 'cookies');
        this.authFile = path.join(this.authDir, 'auth.json');
        this.passFile = path.join(this.authDir, 'pass.json');

        this.ensureDirectories();
    }

    private async ensureDirectories(): Promise<void> {
        await fs.mkdir(this.cookiesDir, { recursive: true });
    }

    async saveCookie(domain: string, cookieContent: string): Promise<boolean> {
        try {
            const cookieFile = path.join(this.cookiesDir, `${domain}.txt`);
            await fs.writeFile(cookieFile, cookieContent, 'utf-8');

            const authEntry: AuthEntry = {
                domain,
                type: 'cookie',
                status: 'success',
                path: cookieFile,
                createdAt: new Date().toISOString()
            };

            await this.updateAuthEntry(authEntry);
            return true;
        } catch (error) {
            console.error('Failed to save cookie:', error);
            return false;
        }
    }

    async saveCredentials(domain: string, username: string, password: string): Promise<boolean> {
        try {
            const credentials = await this.loadCredentials();
            credentials[domain] = { username, password };

            await fs.writeFile(this.passFile, JSON.stringify(credentials, null, 2), 'utf-8');

            const authEntry: AuthEntry = {
                domain,
                type: 'pass',
                status: 'success',
                createdAt: new Date().toISOString()
            };

            await this.updateAuthEntry(authEntry);
            return true;
        } catch (error) {
            console.error('Failed to save credentials:', error);
            return false;
        }
    }

    async listAuthEntries(): Promise<AuthEntry[]> {
        try {
            const data = await fs.readFile(this.authFile, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    async deleteAuth(domain: string, type: 'cookie' | 'pass'): Promise<boolean> {
        try {
            if (type === 'cookie') {
                const cookieFile = path.join(this.cookiesDir, `${domain}.txt`);
                await fs.unlink(cookieFile).catch(() => {});
            } else {
                const credentials = await this.loadCredentials();
                delete credentials[domain];
                await fs.writeFile(this.passFile, JSON.stringify(credentials, null, 2), 'utf-8');
            }

            const entries = await this.listAuthEntries();
            const filtered = entries.filter(e => !(e.domain === domain && e.type === type));
            await fs.writeFile(this.authFile, JSON.stringify(filtered, null, 2), 'utf-8');

            return true;
        } catch (error) {
            console.error('Failed to delete auth:', error);
            return false;
        }
    }

    async getAuthForDomain(domain: string): Promise<AuthData> {
        const entries = await this.listAuthEntries();
        const entry = entries.find(e => e.domain === domain);

        if (!entry) {
            return {};
        }

        if (entry.type === 'cookie' && entry.path) {
            return { cookieFile: entry.path };
        } else if (entry.type === 'pass') {
            const credentials = await this.loadCredentials();
            const cred = credentials[domain];
            if (cred) {
                return { username: cred.username, password: cred.password };
            }
        }

        return {};
    }

    private async updateAuthEntry(entry: AuthEntry): Promise<void> {
        const entries = await this.listAuthEntries();
        const index = entries.findIndex(e => e.domain === entry.domain && e.type === entry.type);

        if (index >= 0) {
            entries[index] = entry;
        } else {
            entries.push(entry);
        }

        await fs.writeFile(this.authFile, JSON.stringify(entries, null, 2), 'utf-8');
    }

    private async loadCredentials(): Promise<Record<string, { username: string; password: string }>> {
        try {
            const data = await fs.readFile(this.passFile, 'utf-8');
            return JSON.parse(data);
        } catch {
            return {};
        }
    }
}