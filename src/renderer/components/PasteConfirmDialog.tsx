import React, { useEffect } from 'react';
import { Clipboard } from 'lucide-react';
import { Button } from './ui/Button';

interface PasteConfirmDialogProps {
    isVisible: boolean;
    clipboardText: string;
    onConfirm: () => void;
    onCancel: () => void;
    position?: { x: number; y: number };
}

export const PasteConfirmDialog: React.FC<PasteConfirmDialogProps> = ({
    isVisible,
    clipboardText,
    onConfirm,
    onCancel,
    position = { x: 0, y: 0 }
}) => {
    // Auto-hide after 5 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onCancel();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onCancel]);

    if (!isVisible) return null;

    // Truncate long URLs for display
    const displayText = clipboardText.length > 60 
        ? clipboardText.substring(0, 60) + '...' 
        : clipboardText;

    return (
        <div
            className="absolute z-50 max-w-md rounded-xl border border-zinc-700/50 bg-zinc-900/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top duration-300"
            style={{
                left: Math.max(0, Math.min(position.x, window.innerWidth - 400)),
                top: position.y + 8,
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700/30">
                <div className="p-1.5 bg-blue-500/20 rounded-md">
                    <Clipboard className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-zinc-200">Paste URL from clipboard?</span>
            </div>
            
            {/* URL Preview */}
            <div className="px-4 py-3">
                <div className="bg-zinc-800/50 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 break-all border border-zinc-700/30">
                    {displayText}
                </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 px-4 py-3 border-t border-zinc-700/30">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onCancel}
                    className="flex-1 text-xs"
                >
                    Ignore
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onConfirm}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                >
                    <Clipboard className="h-3 w-3 mr-1" />
                    Paste
                </Button>
            </div>
        </div>
    );
};