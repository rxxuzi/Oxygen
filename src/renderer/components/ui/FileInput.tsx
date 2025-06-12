import React, { forwardRef, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onFileSelect?: (file: File | null) => void;
  buttonText?: string;
  fileName?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onFileSelect, buttonText = 'Choose File', fileName, accept, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onFileSelect?.(file);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const handleButtonClick = () => {
      inputRef.current?.click();
    };

    return (
      <div className={cn('w-full', className)}>
        <input
          type="file"
          ref={ref || inputRef}
          className="sr-only"
          accept={accept}
          onChange={handleFileChange}
          {...props}
        />
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className="shrink-0"
          >
            {buttonText}
          </Button>
          
          <div className="flex-1 min-w-0">
            {fileName ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-300 truncate">{fileName}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="File selected"/>
              </div>
            ) : (
              <span className="text-sm text-zinc-400">No file selected</span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';