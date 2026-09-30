'use client';

import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-800 border-slate-200',
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-sky-100 text-sky-800 border-sky-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', size = 'sm', icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center justify-center rounded-full border font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
