'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className = '', icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 ${className}`}
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
          <Icon className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
