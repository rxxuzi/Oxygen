import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="relative w-full h-full p-10 overflow-y-auto overflow-x-hidden scrollbar-panel max-md:px-4 max-md:py-6 max-[480px]:px-3 max-[480px]:py-4">
            <div className="w-full max-w-[800px] mx-auto animate-fade-in-up">
                <div className="w-full">
                    {/* Cookie Authentication Section */}
                    <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="text-white/40 text-lg">
                                <Cookie size={20} />
                            </div>
                            <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Cookie Authentication</h2>
                        </div>

                        <form onSubmit={handleCookieSubmit} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Website URL</label>
                                <div className="relative flex items-center">
                                    <Link size={16} className="absolute left-4 text-white/40 z-[1]" />
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={cookieUrl}
                                        onChange={(e) => setCookieUrl(e.target.value)}
                                        className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] pl-11 pr-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Cookies File</label>
                                <div className="w-full">
                                    <FileInput
                                        accept=".txt"
                                        onFileSelect={setCookieFile}
                                        buttonText="Choose File"
                                        fileName={cookieFile?.name}
                                    />
                                </div>
                                <div className="text-xs text-white/40 leading-relaxed">
                                    Export cookies from your browser in Netscape format
                                </div>
                            </div>

                            <button type="submit" className="flex items-center justify-center gap-2 w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/70 text-sm font-medium cursor-pointer transition-all duration-200 font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/90 active:scale-[0.98]">
                                <Upload size={16} />
                                Upload Cookies
                            </button>
                        </form>
                    </div>

                    {/* Password Authentication Section */}
                    <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="text-white/40 text-lg">
                                <KeyRound size={20} />
                            </div>
                            <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Password Authentication</h2>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Website URL</label>
                                <div className="relative flex items-center">
                                    <Link size={16} className="absolute left-4 text-white/40 z-[1] max-[480px]:hidden" />
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={passUrl}
                                        onChange={(e) => setPassUrl(e.target.value)}
                                        className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] pl-11 pr-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30 max-[480px]:pl-4"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Username</label>
                                    <input
                                        type="text"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-[13px] font-medium text-white/70 tracking-[0.01em]">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-4 text-sm text-white/90 transition-all duration-200 font-[inherit] font-normal hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-white/30"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="flex items-center justify-center gap-2 w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/70 text-sm font-medium cursor-pointer transition-all duration-200 font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/90 active:scale-[0.98]">
                                <Save size={16} />
                                Save Credentials
                            </button>
                        </form>
                    </div>

                    {/* Saved Authentication Section */}
                    <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="text-white/40 text-lg">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Saved Authentication</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                            {authEntries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
                                    <Shield size={48} className="text-white/20 mb-4" />
                                    <div className="text-base font-medium text-white/70 mb-2">No authentication entries</div>
                                    <div className="text-sm text-white/40">Add cookie or password authentication above</div>
                                </div>
                            ) : (
                                authEntries.map((entry) => (
                                    <div key={`${entry.domain}-${entry.type}`} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.08] max-md:p-3 max-[480px]:gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            {entry.status === 'success' ? (
                                                <CheckCircle size={20} className="text-green-500/80" />
                                            ) : (
                                                <XCircle size={20} className="text-red-500/80" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4 mb-2 max-md:flex-col max-md:gap-2 max-md:items-stretch">
                                                <div className="text-sm font-medium text-white/90 font-mono overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 max-[480px]:text-[13px]">
                                                    {entry.domain}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-white/60 bg-white/5 border border-white/[0.08] rounded-md px-2 py-1 whitespace-nowrap max-md:self-start">
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

                                            <div className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-stretch max-md:gap-1">
                                                <div className="flex items-center gap-1 text-xs text-white/40 whitespace-nowrap">
                                                    <Clock size={12} />
                                                    {formatDate(entry.createdAt)}
                                                </div>
                                                <div className="text-xs text-white/50 font-medium text-right max-md:text-left">
                                                    {entry.status === 'success' ? 'Active' : 'Error'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            <button
                                                onClick={() => handleDelete(entry.domain, entry.type)}
                                                className="flex items-center justify-center w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500/80 cursor-pointer transition-all duration-200 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-500/90 hover:-translate-y-px active:scale-95"
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
