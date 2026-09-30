'use client';

import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`w-full flex flex-col space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
              focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors
              touch-manipulation
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'}
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
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

Input.displayName = 'Input';
