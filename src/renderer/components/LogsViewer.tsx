import React, { useState, useEffect } from 'react';
import { useLogsStore } from '../stores/logs-store';
import { Button } from './ui/Button';
import { Card } from './ui/card';

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
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex flex-wrap gap-3">
                    <Button onClick={openLogsFolder} variant="secondary">
                        Open Logs Folder
                    </Button>
                    <Button onClick={handleLoadLogs} variant="secondary" disabled={isLoading} loading={isLoading}>
                        {isLoading ? 'Loading...' : 'Reload Logs'}
                    </Button>
                    <Button onClick={handleClearLogs} variant="destructive">
                        Clear All Logs
                    </Button>
                </div>
            </Card>

            <Card className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-3 font-medium text-foreground">Result</th>
                                <th className="text-left p-3 font-medium text-foreground">Date</th>
                                <th className="text-left p-3 font-medium text-foreground">URL</th>
                                <th className="text-left p-3 font-medium text-foreground">Folder</th>
                                <th className="text-left p-3 font-medium text-foreground">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted-foreground p-8">
                                        No download logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, index) => (
                                    <tr key={index} className="border-b border-border hover:bg-accent/50 transition-colors">
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                                                log.result === 'success' 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {log.result === 'success' ? '✓ Success' : '✗ Failed'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {formatDate(log.date)}
                                        </td>
                                        <td className="p-3 max-w-xs">
                                            <div className="truncate text-sm" title={log.url}>
                                                {log.url}
                                            </div>
                                        </td>
                                        <td className="p-3 max-w-xs">
                                            <div className="truncate text-sm text-muted-foreground" title={log.folder}>
                                                {log.folder}
                                            </div>
                                        </td>
                                        <td className="p-3 max-w-xs">
                                            <div className="truncate text-sm">
                                                {log.result === 'success'
                                                    ? log.filename || 'Downloaded'
                                                    : log.error || 'Unknown error'}
                                            </div>
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