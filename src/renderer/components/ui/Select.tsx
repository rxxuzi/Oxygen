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
                    <label htmlFor={selectId} className="block text-sm font-medium text-zinc-300 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            "flex h-9 w-full rounded-md border border-zinc-700/50 bg-zinc-900/50 px-3 py-1 pr-10 text-sm shadow-sm transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0 focus:border-blue-400/50",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "appearance-none cursor-pointer hover:bg-zinc-800/60 hover:border-zinc-600/70 backdrop-blur-sm text-zinc-100",
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
                                className="bg-zinc-900 text-zinc-100"
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 pointer-events-none" 
                        size={16} 
                    />
                </div>
                {helperText && (
                    <p className={cn(
                        "text-xs mt-1",
                        error ? 'text-red-500' : 'text-zinc-400'
                    )}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';