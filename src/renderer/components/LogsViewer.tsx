import React, { useState, useEffect } from 'react';
import { useLogsStore } from '../stores/logs-store';
import { Button } from './ui/Button';

export function LogsViewer() {
    const { logs, loadLogs, clearLogs, openLogsFolder } = useLogsStore();
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Button onClick={openLogsFolder} variant="secondary">
                    Open Logs Folder
                </Button>
                <Button onClick={handleLoadLogs} variant="secondary" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Reload Logs'}
                </Button>
                <Button onClick={handleClearLogs} variant="danger">
                    Clear All Logs
                </Button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Result</th>
                        <th>Date</th>
                        <th>URL</th>
                        <th>Folder</th>
                        <th>Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center text-muted-foreground">
                                No download logs found
                            </td>
                        </tr>
                    ) : (
                        logs.map((log, index) => (
                            <tr key={index} className={log.result === 'success' ? 'good' : 'bad'}>
                                <td>{log.result === 'success' ? '✓ Success' : '✗ Failed'}</td>
                                <td>{formatDate(log.date)}</td>
                                <td className="truncate max-w-xs" title={log.url}>
                                    {log.url}
                                </td>
                                <td className="truncate max-w-xs" title={log.folder}>
                                    {log.folder}
                                </td>
                                <td className="truncate max-w-xs">
                                    {log.result === 'success'
                                        ? log.filename || 'Downloaded'
                                        : log.error || 'Unknown error'}
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