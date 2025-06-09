import React, { forwardRef } from 'react';

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
                    <label htmlFor={selectId} className="block text-sm mb-2">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`select ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                >
                    {options.map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                {helperText && (
                    <p className={`text-xs mt-1 ${error ? 'text-danger' : 'text-muted-foreground'}`}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';