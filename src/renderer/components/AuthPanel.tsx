import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/card';
import { FileInput } from './ui/FileInput';

export function AuthPanel() {
    const { authEntries, loadAuthEntries, saveCookie, saveCredentials, deleteAuth } = useAuthStore();

    // Cookie form state
    const [cookieUrl, setCookieUrl] = useState('');
    const [cookieFile, setCookieFile] = useState<File | null>(null);

    // Password form state
    const [passUrl, setPassUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        loadAuthEntries();
    }, [loadAuthEntries]);

    const handleCookieSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cookieUrl || !cookieFile) {
            alert('Please enter a URL and select a cookie file');
            return;
        }

        const content = await cookieFile.text();
        const success = await saveCookie(cookieUrl, content);

        if (success) {
            alert('Cookie saved successfully');
            setCookieUrl('');
            setCookieFile(null);
            loadAuthEntries();
        } else {
            alert('Failed to save cookie');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passUrl || !username || !password) {
            alert('Please fill all fields');
            return;
        }

        const success = await saveCredentials(passUrl, username, password);

        if (success) {
            alert('Credentials saved successfully');
            setPassUrl('');
            setUsername('');
            setPassword('');
            loadAuthEntries();
        } else {
            alert('Failed to save credentials');
        }
    };

    const handleDelete = async (domain: string, type: 'cookie' | 'pass') => {
        if (confirm(`Delete ${type} for ${domain}?`)) {
            const success = await deleteAuth(domain, type);
            if (success) {
                loadAuthEntries();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Cookie Form */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Add Cookie Authentication</h3>

                <form onSubmit={handleCookieSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Website URL
                        </label>
                        <Input
                            type="url"
                            placeholder="https://example.com"
                            value={cookieUrl}
                            onChange={(e) => setCookieUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Select cookies.txt file
                        </label>
                        <FileInput
                            accept=".txt"
                            onFileSelect={setCookieFile}
                            buttonText="Choose File"
                            fileName={cookieFile?.name}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Export cookies from your browser in Netscape format
                        </p>
                    </div>

                    <Button type="submit" variant="primary" className="w-full">
                        Upload Cookies
                    </Button>
                </form>
            </Card>

            {/* Password Form */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Add Password Authentication</h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Website URL
                        </label>
                        <Input
                            type="url"
                            placeholder="https://example.com"
                            value={passUrl}
                            onChange={(e) => setPassUrl(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Username
                            </label>
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full">
                        Save Credentials
                    </Button>
                </form>
            </Card>

            {/* Auth Table */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Saved Authentication</h3>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-3 font-medium text-foreground">Status</th>
                                <th className="text-left p-3 font-medium text-foreground">Domain</th>
                                <th className="text-left p-3 font-medium text-foreground">Type</th>
                                <th className="text-left p-3 font-medium text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {authEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted-foreground p-8">
                                        No authentication entries
                                    </td>
                                </tr>
                            ) : (
                                authEntries.map((entry) => (
                                    <tr key={`${entry.domain}-${entry.type}`} className="border-b border-border hover:bg-accent/50 transition-colors">
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                                                entry.status === 'success' 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {entry.status === 'success' ? '✓ Active' : '✗ Error'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm">{entry.domain}</td>
                                        <td className="p-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                                                {entry.type === 'cookie' ? 'Cookie' : 'Password'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                onClick={() => handleDelete(entry.domain, entry.type)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}