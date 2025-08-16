import React, { useState, useEffect, useMemo } from 'react';
import { useLogsStore } from '../stores/logs-store';
import { LogEntry } from '../../shared/types';
import { Button } from './ui/Button';
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
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import '../styles/logs.css';

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
        <div className="logs-container">
            <div className="logs-box">
                <div className="logs-content">
                    {/* Actions Section */}
                    <div className="logs-section">
                        <div className="logs-section-header">
                            <div className="logs-section-icon">
                                <FileText size={20} />
                            </div>
                            <h2 className="logs-section-title">Download Logs</h2>
                        </div>

                        <div className="logs-actions">
                            <button 
                                onClick={openLogsFolder} 
                                className="logs-action-button"
                            >
                                <FolderOpen size={16} />
                                Open Logs Folder
                            </button>
                            <button 
                                onClick={handleLoadLogs} 
                                className="logs-action-button"
                                disabled={isLoading}
                            >
                                <RotateCcw size={16} />
                                {isLoading ? 'Loading...' : 'Reload Logs'}
                            </button>
                            <button 
                                onClick={handleClearLogs} 
                                className="logs-action-button logs-action-destructive"
                            >
                                <Trash2 size={16} />
                                Clear All Logs
                            </button>
                        </div>
                    </div>

                    {/* Filter and Sort Section */}
                    {logs.length > 0 && (
                        <div className="logs-section">
                            <div className="logs-section-header">
                                <div className="logs-section-icon">
                                    <Filter size={20} />
                                </div>
                                <h2 className="logs-section-title">Filter & Sort</h2>
                            </div>

                            <div className="logs-controls">
                                <div className="logs-filters">
                                    <button 
                                        onClick={() => setFilter('all')}
                                        className={`logs-filter-button ${filter === 'all' ? 'active' : ''}`}
                                    >
                                        All ({getFilterCount('all')})
                                    </button>
                                    <button 
                                        onClick={() => setFilter('success')}
                                        className={`logs-filter-button ${filter === 'success' ? 'active' : ''}`}
                                    >
                                        <CheckCircle size={14} />
                                        Success ({getFilterCount('success')})
                                    </button>
                                    <button 
                                        onClick={() => setFilter('failed')}
                                        className={`logs-filter-button ${filter === 'failed' ? 'active' : ''}`}
                                    >
                                        <XCircle size={14} />
                                        Failed ({getFilterCount('failed')})
                                    </button>
                                </div>
                                
                                <div className="logs-sort">
                                    <button 
                                        onClick={toggleSort}
                                        className="logs-sort-button"
                                    >
                                        {getSortIcon()}
                                        Date {sort === 'date-desc' ? '(Newest)' : '(Oldest)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>

                    {/* Logs List Section */}
                    <div className="logs-section">
                        <div className="logs-section-header">
                            <div className="logs-section-icon">
                                <Calendar size={20} />
                            </div>
                            <h2 className="logs-section-title">Recent Downloads</h2>
                        </div>

                        <div className="logs-list">
                            {filteredAndSortedLogs.length === 0 ? (
                                <div className="logs-empty">
                                    {logs.length === 0 ? (
                                        <>
                                            <FileText size={48} className="logs-empty-icon" />
                                            <div className="logs-empty-title">No download logs found</div>
                                            <div className="logs-empty-description">Your download history will appear here</div>
                                        </>
                                    ) : (
                                        <>
                                            <Filter size={48} className="logs-empty-icon" />
                                            <div className="logs-empty-title">No logs match your filter</div>
                                            <div className="logs-empty-description">Try adjusting your filter criteria</div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                filteredAndSortedLogs.map((log, index) => (
                                    <div key={index} className="logs-item">
                                        <div className="logs-item-status">
                                            {log.result === 'success' ? (
                                                <CheckCircle size={20} className="logs-status-success" />
                                            ) : (
                                                <XCircle size={20} className="logs-status-error" />
                                            )}
                                        </div>
                                        
                                        <div className="logs-item-content">
                                            <div className="logs-item-main">
                                                <div className="logs-item-url" title={log.url}>
                                                    <Link size={14} className="logs-item-url-icon" />
                                                    <span className="logs-item-url-text">{log.url}</span>
                                                </div>
                                                <div className="logs-item-date">
                                                    {formatDate(log.date)}
                                                </div>
                                            </div>
                                            
                                            <div className="logs-item-details">
                                                <div className="logs-item-folder" title={log.folder}>
                                                    <Folder size={12} />
                                                    <span className="logs-item-folder-text">{log.folder}</span>
                                                </div>
                                                <div className="logs-item-result">
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
        
    );
}