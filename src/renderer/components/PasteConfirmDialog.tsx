import React, { useEffect, useRef } from 'react';

interface PasteConfirmDialogProps {
    isVisible: boolean;
    clipboardText: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const PasteConfirmDialog: React.FC<PasteConfirmDialogProps> = ({
    isVisible,
    clipboardText,
    onConfirm,
    onCancel
}) => {
    const [isClosing, setIsClosing] = React.useState(false);

    // Auto-hide after 5 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                handleCancel();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isVisible) {
                handleCancel();
            }
        };
        
        if (isVisible) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isVisible]);

    const handleCancel = () => {
        setIsClosing(true);
        setTimeout(() => {
            onCancel();
            setIsClosing(false);
        }, 200);
    };

    const handleConfirm = () => {
        setIsClosing(true);
        setTimeout(() => {
            onConfirm();
            setIsClosing(false);
        }, 200);
    };

    if (!isVisible) return null;

    // Truncate long URLs for display
    const displayText = clipboardText.length > 60
        ? clipboardText.substring(0, 60) + '...'
        : clipboardText;

    return (
        <div className={`paste-toast ${isClosing ? 'closing' : ''}`}>
            <div className="paste-toast-content">
                <div className="paste-toast-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </div>
                <div className="paste-toast-text">
                    <div className="paste-toast-title">Paste from clipboard?</div>
                    <div className="paste-toast-url">{displayText}</div>
                </div>
            </div>
            <div className="paste-toast-actions">
                <button 
                    className="paste-toast-button paste-toast-cancel"
                    onClick={handleCancel}
                    type="button"
                >
                    Cancel
                </button>
                <button 
                    className="paste-toast-button paste-toast-confirm"
                    onClick={handleConfirm}
                    type="button"
                    autoFocus
                >
                    Paste
                </button>
            </div>
        </div>
    );
};