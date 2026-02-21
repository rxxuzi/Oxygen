import React, { useState, useEffect, useMemo } from 'react';
import { useLogsStore } from '../stores/logs-store';
import {
    FileText,
    FolderOpen,
    RotateCcw,
    Trash2,
    CheckCircle,
    XCircle,
    Calendar,
    Link,
    Folder,
    Filter,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

type FilterType = 'all' | 'success' | 'failed';
type SortType = 'date-desc' | 'date-asc';

export function LogsViewer() {
    const { logs, loadLogs, clearLogs, openLogsFolder } = useLogsStore();
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortType>('date-desc');

    useEffect(() => {
        handleLoadLogs();
    }, []);

    const handleLoadLogs = async () => {
        setIsLoading(true);
        await loadLogs();
        setIsLoading(false);
    };

    const handleClearLogs = async () => {
        if (confirm('Are you sure you want to clear all logs?')) {
            await clearLogs();
            await loadLogs();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Filter and sort logs
    const filteredAndSortedLogs = useMemo(() => {
        let filtered = logs;

        // Apply filter
        if (filter !== 'all') {
            filtered = logs.filter(log => log.result === filter);
        }

        // Apply sort
        filtered = [...filtered].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (sort === 'date-desc') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        return filtered;
    }, [logs, filter, sort]);

    const toggleSort = () => {
        setSort(prev => prev === 'date-desc' ? 'date-asc' : 'date-desc');
    };

    const getSortIcon = () => {
        if (sort === 'date-desc') return <ArrowDown size={14} />;
        return <ArrowUp size={14} />;
    };

    const getFilterCount = (filterType: FilterType) => {
        if (filterType === 'all') return logs.length;
        return logs.filter(log => log.result === filterType).length;
    };

    return (
        <div className="relative w-full h-full p-10 overflow-y-auto overflow-x-hidden scrollbar-panel max-md:px-4 max-md:py-6 max-[480px]:px-3 max-[480px]:py-4">
            <div className="w-full max-w-[800px] mx-auto animate-fade-in-up">
                <div className="w-full">
                    {/* Actions Section */}
                    <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="text-white/40 text-lg">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Download Logs</h2>
                        </div>

                        <div className="flex flex-wrap gap-3 max-md:flex-col">
                            <button
                                onClick={openLogsFolder}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/70 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/90 max-md:justify-center"
                            >
                                <FolderOpen size={16} />
                                Open Logs Folder
                            </button>
                            <button
                                onClick={handleLoadLogs}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/70 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/90 disabled:opacity-50 disabled:cursor-not-allowed max-md:justify-center"
                                disabled={isLoading}
                            >
                                <RotateCcw size={16} />
                                {isLoading ? 'Loading...' : 'Reload Logs'}
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-red-500/20 rounded-[10px] text-red-500/80 text-[13px] font-medium cursor-pointer transition-all duration-200 font-[inherit] hover:bg-red-500/5 hover:border-red-500/30 hover:text-red-500/90 max-md:justify-center"
                            >
                                <Trash2 size={16} />
                                Clear All Logs
                            </button>
                        </div>
                    </div>

                    {/* Filter and Sort Section */}
                    {logs.length > 0 && (
                        <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="text-white/40 text-lg">
                                    <Filter size={20} />
                                </div>
                                <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Filter & Sort</h2>
                            </div>

                            <div className="flex flex-wrap justify-between items-center gap-4 max-md:flex-col max-md:items-stretch max-md:gap-3">
                                <div className="flex flex-wrap gap-2 max-[480px]:flex-col max-[480px]:w-full">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-xs font-medium cursor-pointer transition-all duration-200 font-[inherit] whitespace-nowrap hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/80 max-[480px]:justify-center max-[480px]:w-full ${filter === 'all' ? 'bg-blue-500/15 border-blue-500/30 text-blue-500/90' : ''}`}
                                    >
                                        All ({getFilterCount('all')})
                                    </button>
                                    <button
                                        onClick={() => setFilter('success')}
                                        className={`flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-xs font-medium cursor-pointer transition-all duration-200 font-[inherit] whitespace-nowrap hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/80 max-[480px]:justify-center max-[480px]:w-full ${filter === 'success' ? 'bg-blue-500/15 border-blue-500/30 text-blue-500/90' : ''}`}
                                    >
                                        <CheckCircle size={14} />
                                        Success ({getFilterCount('success')})
                                    </button>
                                    <button
                                        onClick={() => setFilter('failed')}
                                        className={`flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-xs font-medium cursor-pointer transition-all duration-200 font-[inherit] whitespace-nowrap hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/80 max-[480px]:justify-center max-[480px]:w-full ${filter === 'failed' ? 'bg-blue-500/15 border-blue-500/30 text-blue-500/90' : ''}`}
                                    >
                                        <XCircle size={14} />
                                        Failed ({getFilterCount('failed')})
                                    </button>
                                </div>

                                <div className="flex gap-2 max-md:justify-center">
                                    <button
                                        onClick={toggleSort}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 text-xs font-medium cursor-pointer transition-all duration-200 font-[inherit] whitespace-nowrap hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/80"
                                    >
                                        {getSortIcon()}
                                        Date {sort === 'date-desc' ? '(Newest)' : '(Oldest)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logs List Section */}
                    <div className="mb-8 pb-8 border-b border-white/[0.04] last:mb-0 last:pb-0 last:border-b-0">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="text-white/40 text-lg">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-[11px] font-semibold text-white/50 tracking-[0.08em] uppercase">Recent Downloads</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                            {filteredAndSortedLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
                                    {logs.length === 0 ? (
                                        <>
                                            <FileText size={48} className="text-white/20 mb-4" />
                                            <div className="text-base font-medium text-white/70 mb-2">No download logs found</div>
                                            <div className="text-sm text-white/40">Your download history will appear here</div>
                                        </>
                                    ) : (
                                        <>
                                            <Filter size={48} className="text-white/20 mb-4" />
                                            <div className="text-base font-medium text-white/70 mb-2">No logs match your filter</div>
                                            <div className="text-sm text-white/40">Try adjusting your filter criteria</div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                filteredAndSortedLogs.map((log, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.08] max-md:p-3 max-[480px]:gap-3">
                                        <div className="shrink-0 mt-0.5 max-[480px]:self-start max-[480px]:mt-0">
                                            {log.result === 'success' ? (
                                                <CheckCircle size={20} className="text-green-500/80" />
                                            ) : (
                                                <XCircle size={20} className="text-red-500/80" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4 mb-2 max-md:flex-col max-md:gap-2 max-md:items-stretch">
                                                <div className="flex items-center gap-2 text-sm font-medium text-white/90 min-w-0 flex-1" title={log.url}>
                                                    <Link size={14} className="shrink-0 text-white/40 max-[480px]:hidden" />
                                                    <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0 max-[480px]:text-[13px]">{log.url}</span>
                                                </div>
                                                <div className="text-xs text-white/50 whitespace-nowrap font-medium max-md:text-[11px] max-md:text-left">
                                                    {formatDate(log.date)}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center gap-4 max-md:flex-col max-md:items-stretch max-md:gap-1.5">
                                                <div className="flex items-center gap-1.5 text-xs text-white/40 min-w-0 flex-1" title={log.folder}>
                                                    <Folder size={12} className="shrink-0" />
                                                    <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{log.folder}</span>
                                                </div>
                                                <div className="text-xs text-white/60 text-right max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap max-md:text-left max-md:max-w-none max-md:text-[11px]">
                                                    {log.result === 'success'
                                                        ? log.filename || 'Downloaded'
                                                        : log.error || 'Unknown error'}
                                                </div>
                                            </div>
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
