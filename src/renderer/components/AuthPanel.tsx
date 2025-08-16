import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/card';
import { FileInput } from './ui/FileInput';
import { 
    Shield, 
    Cookie, 
    KeyRound, 
    Upload, 
    Save, 
    Trash2,
    CheckCircle,
    XCircle,
    Link,
    Clock
} from 'lucide-react';
import '../styles/auth.css';

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
            // TODO: Replace with toast notification
            alert('Please enter a URL and select a cookie file');
            return;
        }

        const content = await cookieFile.text();
        const success = await saveCookie(cookieUrl, content);

        if (success) {
            // TODO: Replace with toast notification
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
            // TODO: Replace with toast notification
            alert('Please fill all fields');
            return;
        }

        const success = await saveCredentials(passUrl, username, password);

        if (success) {
            // TODO: Replace with toast notification
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
        // TODO: Replace with modal confirmation
        if (confirm(`Delete ${type} for ${domain}?`)) {
            const success = await deleteAuth(domain, type);
            if (success) {
                loadAuthEntries();
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-content">
                    {/* Cookie Authentication Section */}
                    <div className="auth-section">
                        <div className="auth-section-header">
                            <div className="auth-section-icon">
                                <Cookie size={20} />
                            </div>
                            <h2 className="auth-section-title">Cookie Authentication</h2>
                        </div>

                        <form onSubmit={handleCookieSubmit} className="auth-form">
                            <div className="auth-field">
                                <label className="auth-label">Website URL</label>
                                <div className="auth-input-group">
                                    <Link size={16} className="auth-input-icon" />
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={cookieUrl}
                                        onChange={(e) => setCookieUrl(e.target.value)}
                                        className="auth-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label className="auth-label">Cookies File</label>
                                <div className="auth-file-input">
                                    <FileInput
                                        accept=".txt"
                                        onFileSelect={setCookieFile}
                                        buttonText="Choose File"
                                        fileName={cookieFile?.name}
                                    />
                                </div>
                                <div className="auth-help-text">
                                    Export cookies from your browser in Netscape format
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-button">
                                <Upload size={16} />
                                Upload Cookies
                            </button>
                        </form>
                    </div>

                    {/* Password Authentication Section */}
                    <div className="auth-section">
                        <div className="auth-section-header">
                            <div className="auth-section-icon">
                                <KeyRound size={20} />
                            </div>
                            <h2 className="auth-section-title">Password Authentication</h2>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="auth-form">
                            <div className="auth-field">
                                <label className="auth-label">Website URL</label>
                                <div className="auth-input-group">
                                    <Link size={16} className="auth-input-icon" />
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={passUrl}
                                        onChange={(e) => setPassUrl(e.target.value)}
                                        className="auth-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-credentials">
                                <div className="auth-field">
                                    <label className="auth-label">Username</label>
                                    <input
                                        type="text"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="auth-input"
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="auth-input"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="auth-submit-button">
                                <Save size={16} />
                                Save Credentials
                            </button>
                        </form>
                    </div>

                    {/* Saved Authentication Section */}
                    <div className="auth-section">
                        <div className="auth-section-header">
                            <div className="auth-section-icon">
                                <Shield size={20} />
                            </div>
                            <h2 className="auth-section-title">Saved Authentication</h2>
                        </div>

                        <div className="auth-entries">
                            {authEntries.length === 0 ? (
                                <div className="auth-empty">
                                    <Shield size={48} className="auth-empty-icon" />
                                    <div className="auth-empty-title">No authentication entries</div>
                                    <div className="auth-empty-description">Add cookie or password authentication above</div>
                                </div>
                            ) : (
                                authEntries.map((entry) => (
                                    <div key={`${entry.domain}-${entry.type}`} className="auth-entry">
                                        <div className="auth-entry-status">
                                            {entry.status === 'success' ? (
                                                <CheckCircle size={20} className="auth-status-success" />
                                            ) : (
                                                <XCircle size={20} className="auth-status-error" />
                                            )}
                                        </div>
                                        
                                        <div className="auth-entry-content">
                                            <div className="auth-entry-main">
                                                <div className="auth-entry-domain">
                                                    {entry.domain}
                                                </div>
                                                <div className="auth-entry-type">
                                                    {entry.type === 'cookie' ? (
                                                        <>
                                                            <Cookie size={12} />
                                                            Cookie
                                                        </>
                                                    ) : (
                                                        <>
                                                            <KeyRound size={12} />
                                                            Password
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="auth-entry-details">
                                                <div className="auth-entry-date">
                                                    <Clock size={12} />
                                                    {formatDate(entry.createdAt)}
                                                </div>
                                                <div className="auth-entry-status-text">
                                                    {entry.status === 'success' ? 'Active' : 'Error'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="auth-entry-actions">
                                            <button
                                                onClick={() => handleDelete(entry.domain, entry.type)}
                                                className="auth-delete-button"
                                                title={`Delete ${entry.type} for ${entry.domain}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}