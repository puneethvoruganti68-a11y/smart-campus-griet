'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950 focus-visible:ring-blue-900',
  secondary: 'bg-blue-100 text-blue-900 hover:bg-blue-200 active:bg-blue-300 focus-visible:ring-blue-500',
  outline: 'border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-500',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm min-w-[2.25rem]',
  md: 'h-11 px-4 text-base min-w-[2.75rem]',
  lg: 'h-14 px-6 text-lg min-w-[3.5rem]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none touch-manipulation';
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className={`animate-spin ${children ? 'mr-2' : ''} ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} />
        )}
        {!isLoading && icon && iconPosition === 'left' && (
          <span className={children ? 'mr-2' : ''}>{icon}</span>
        )}
        {children}
        {!isLoading && icon && iconPosition === 'right' && (
          <span className={children ? 'ml-2' : ''}>{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
