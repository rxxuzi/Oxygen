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
                    <label htmlFor={selectId} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            "flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 pr-10 text-sm shadow-sm transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "appearance-none cursor-pointer dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-300",
                            error && "border-red-500 focus:ring-red-500",
                            className
                        )}
                        {...props}
                    >
                        {options.map(option => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50"
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 pointer-events-none" 
                        size={16} 
                    />
                </div>
                {helperText && (
                    <p className={cn(
                        "text-xs mt-1",
                        error ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'
                    )}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';