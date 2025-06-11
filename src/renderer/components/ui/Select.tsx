import React, { forwardRef } from 'react';
import { ChevronDownIcon } from './OxygenIcon';
import { cn } from '../../lib/utils';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: boolean;
    helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-foreground mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "appearance-none cursor-pointer",
                            error && "border-destructive focus:ring-destructive",
                            className
                        )}
                        {...props}
                    >
                        {options.map(option => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="bg-background text-foreground"
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" 
                        size={16} 
                    />
                </div>
                {helperText && (
                    <p className={cn(
                        "text-xs mt-1",
                        error ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';