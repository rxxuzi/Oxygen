import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

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
            <div className="card">
                <h3 className="text-xl mb-4">Add Cookie Authentication</h3>

                <form onSubmit={handleCookieSubmit} className="space-y-4">
                    <Input
                        type="url"
                        placeholder="https://example.com"
                        value={cookieUrl}
                        onChange={(e) => setCookieUrl(e.target.value)}
                    />

                    <div>
                        <label className="block text-sm mb-2">Select cookies.txt file:</label>
                        <input
                            type="file"
                            accept=".txt"
                            onChange={(e) => setCookieFile(e.target.files?.[0] || null)}
                            className="w-full"
                        />
                    </div>

                    <Button type="submit" variant="primary" className="w-full">
                        Upload Cookies
                    </Button>
                </form>
            </div>

            {/* Password Form */}
            <div className="card">
                <h3 className="text-xl mb-4">Add Password Authentication</h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <Input
                        type="url"
                        placeholder="https://example.com"
                        value={passUrl}
                        onChange={(e) => setPassUrl(e.target.value)}
                    />

                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button type="submit" variant="primary" className="w-full">
                        Save Credentials
                    </Button>
                </form>
            </div>

            {/* Auth Table */}
            <div className="card">
                <h3 className="text-xl mb-4">Saved Authentication</h3>

                <table className="table">
                    <thead>
                    <tr>
                        <th>Status</th>
                        <th>Domain</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {authEntries.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center text-muted-foreground">
                                No authentication entries
                            </td>
                        </tr>
                    ) : (
                        authEntries.map((entry) => (
                            <tr key={`${entry.domain}-${entry.type}`} className={entry.status === 'success' ? 'good' : 'bad'}>
                                <td>{entry.status}</td>
                                <td>{entry.domain}</td>
                                <td>{entry.type}</td>
                                <td>
                                    <Button
                                        onClick={() => handleDelete(entry.domain, entry.type)}
                                        variant="danger"
                                        className="text-sm py-1 px-3"
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
        </div>
    );
}