'use client';

import React, { forwardRef, SelectHTMLAttributes, useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      label,
      error,
      helperText,
      options,
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className={`w-full flex flex-col space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`
              flex h-11 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
              disabled:cursor-not-allowed disabled:opacity-50 transition-colors touch-manipulation
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {error ? <AlertCircle className="h-5 w-5 text-red-500" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
        {error && (
          <p id={errorId} className="text-sm text-red-500">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
