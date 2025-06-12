import { useState, useCallback } from 'react';

interface UseClipboardPasteProps {
    onPaste: (text: string) => void;
    enabled?: boolean;
}

interface ClipboardPasteState {
    isDialogVisible: boolean;
    clipboardText: string;
    position: { x: number; y: number };
}

export const useClipboardPaste = ({ onPaste, enabled = true }: UseClipboardPasteProps) => {
    const [state, setState] = useState<ClipboardPasteState>({
        isDialogVisible: false,
        clipboardText: '',
        position: { x: 0, y: 0 }
    });

    const isValidURL = (text: string): boolean => {
        try {
            new URL(text);
            return text.startsWith('http://') || text.startsWith('https://');
        } catch {
            return false;
        }
    };

    const handleInputFocus = useCallback(async (event: React.FocusEvent<HTMLInputElement>) => {
        if (!enabled) return;

        // Don't show dialog if input already has value
        if (event.target.value.trim()) return;

        try {
            const clipboardText = await navigator.clipboard.readText();
            
            // Only show dialog if clipboard has valid URL
            if (clipboardText && clipboardText.trim() && isValidURL(clipboardText.trim())) {
                const inputRect = event.target.getBoundingClientRect();
                
                setState({
                    isDialogVisible: true,
                    clipboardText: clipboardText.trim(),
                    position: {
                        x: inputRect.left,
                        y: inputRect.bottom
                    }
                });
            }
        } catch (error) {
            // Clipboard access denied or failed
            console.debug('Clipboard access failed:', error);
        }
    }, [enabled]);

    const handleConfirm = useCallback(() => {
        onPaste(state.clipboardText);
        setState(prev => ({ ...prev, isDialogVisible: false }));
    }, [state.clipboardText, onPaste]);

    const handleCancel = useCallback(() => {
        setState(prev => ({ ...prev, isDialogVisible: false }));
    }, []);

    const hideDialog = useCallback(() => {
        setState(prev => ({ ...prev, isDialogVisible: false }));
    }, []);

    return {
        isDialogVisible: state.isDialogVisible,
        clipboardText: state.clipboardText,
        position: state.position,
        handleInputFocus,
        handleConfirm,
        handleCancel,
        hideDialog
    };
};