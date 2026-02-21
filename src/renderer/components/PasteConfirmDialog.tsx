import React, { useEffect } from 'react';

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
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-auto max-w-[480px] min-w-[360px] bg-[rgba(24,24,24,0.98)] backdrop-blur-[20px] border border-white/10 rounded-xl px-5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] z-[10000] flex items-center justify-between gap-4 ${isClosing ? 'animate-toast-slide-down' : 'animate-toast-slide-up'} max-[520px]:left-4 max-[520px]:right-4 max-[520px]:bottom-4 max-[520px]:translate-x-0 max-[520px]:min-w-0`}>
            <div className="flex items-center gap-3 flex-1 min-w-0 max-[520px]:flex-col max-[520px]:items-start max-[520px]:gap-2">
                <div className="shrink-0 w-9 h-9 bg-blue-500/15 rounded-lg flex items-center justify-center text-blue-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white/95 mb-0.5">Paste from clipboard?</div>
                    <div className="text-xs font-mono text-white/60 overflow-hidden text-ellipsis whitespace-nowrap">{displayText}</div>
                </div>
            </div>
            <div className="flex gap-2 shrink-0 max-[520px]:w-full max-[520px]:mt-2">
                <button
                    className="px-4 py-1.5 border-none rounded-md text-[13px] font-medium cursor-pointer transition-all duration-200 outline-none whitespace-nowrap bg-white/[0.08] text-white/70 hover:bg-white/[0.12] hover:text-white/90 focus-visible:shadow-[0_0_0_2px_rgba(59,130,246,0.5)] max-[520px]:flex-1"
                    onClick={handleCancel}
                    type="button"
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-1.5 border-none rounded-md text-[13px] font-medium cursor-pointer transition-all duration-200 outline-none whitespace-nowrap bg-blue-500 text-white hover:bg-[rgb(79,140,255)] focus-visible:shadow-[0_0_0_2px_rgba(59,130,246,0.5)] max-[520px]:flex-1"
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
