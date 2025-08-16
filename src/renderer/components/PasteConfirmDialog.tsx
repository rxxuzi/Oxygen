import React, { useEffect } from 'react';

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
                                                                          onCancel
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
    const displayText = clipboardText.length > 50
        ? clipboardText.substring(0, 50) + '...'
        : clipboardText;

    return (
        <div className="paste-confirm-dialog">
            {/* Header */}
            <div className="paste-confirm-header">
                <div className="paste-confirm-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </div>
                <span className="paste-confirm-title">Paste from clipboard?</span>
            </div>

            {/* URL Preview */}
            <div className="paste-confirm-content">
                <div className="paste-confirm-url">
                    {displayText}
                </div>
            </div>

            {/* Actions */}
            <div className="paste-confirm-actions">
                <button
                    className="paste-confirm-button secondary"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="paste-confirm-button primary"
                    onClick={onConfirm}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Paste URL
                </button>
            </div>
        </div>
    );
};