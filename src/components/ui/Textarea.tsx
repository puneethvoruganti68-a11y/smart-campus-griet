'use client';

import React, { forwardRef, TextareaHTMLAttributes, useId, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      label,
      error,
      helperText,
      autoResize = false,
      containerClassName = '',
      id,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    // Merge refs
    const setRef = (element: HTMLTextAreaElement | null) => {
      innerRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
      }
    };

    const handleResize = () => {
      if (autoResize && innerRef.current) {
        innerRef.current.style.height = 'auto';
        innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
      }
    };

    useEffect(() => {
      if (autoResize) {
        handleResize();
      }
    }, [autoResize, props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        handleResize();
      }
      if (onChange) {
        onChange(e);
      }
    };

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
          <textarea
            id={inputId}
            ref={setRef}
            rows={rows}
            onChange={handleChange}
            className={`
              flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
              focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors
              resize-none touch-manipulation
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'}
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
            {...props}
          />
          {error && (
            <div className="absolute top-2 right-2 pointer-events-none text-red-500">
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

Textarea.displayName = 'Textarea';
