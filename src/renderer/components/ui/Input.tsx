import * as React from "react"
import { cn } from "../../lib/utils"
import { useClipboardPaste } from "../../hooks/useClipboardPaste"
import { PasteConfirmDialog } from "../PasteConfirmDialog"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
  enableClipboardPaste?: boolean;
  onClipboardPaste?: (text: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, id, enableClipboardPaste, onClipboardPaste, onFocus, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const {
      isDialogVisible,
      clipboardText,
      handleInputFocus,
      handleConfirm,
      handleCancel
    } = useClipboardPaste({
      onPaste: onClipboardPaste || (() => {}),
      enabled: enableClipboardPaste
    });

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
      if (enableClipboardPaste) {
        handleInputFocus(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-300 mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          onFocus={handleFocus}
          className={cn(
            "flex h-10 w-full rounded-lg border border-zinc-700/50 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-100 transition-colors duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 hover:border-zinc-600 hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Paste confirmation dialog */}
        <PasteConfirmDialog
          isVisible={isDialogVisible}
          clipboardText={clipboardText}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
        {helperText && (
          <p className={cn(
            "text-xs mt-1",
            error ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }