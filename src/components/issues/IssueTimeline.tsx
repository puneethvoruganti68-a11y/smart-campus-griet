'use client';

import React, { useEffect, useState } from 'react';
import { IssueHistory } from '@/lib/types';
import { STATUS_CONFIG, formatDateTime } from '@/lib/constants';
import * as Icons from 'lucide-react';

interface IssueTimelineProps {
  history: IssueHistory[];
}

export default function IssueTimeline({ history }: IssueTimelineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!history || history.length === 0) return null;

  return (
    <div className="relative pl-6 sm:pl-8 py-2">
      <div className="absolute top-0 bottom-0 left-3 sm:left-4 w-0.5 bg-slate-200"></div>
      
      <div className="space-y-6">
        {history.map((entry, index) => {
          const statusConfig = STATUS_CONFIG[entry.status];
          const IconComponent = (Icons as any)[statusConfig.icon] || Icons.Activity;
          const authorName = entry.changedBy === 'system' ? 'System' : entry.changedBy;

          return (
            <div 
              key={entry.id} 
              className={`relative transition-all duration-500 ease-out ${
                mounted 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div 
                className="absolute -left-9 sm:-left-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                style={{ backgroundColor: statusConfig.color }}
              >
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-2 gap-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs sm:text-sm font-semibold"
                      style={{ color: statusConfig.textColor }}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="text-xs text-slate-400">by {authorName}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>
                
                {entry.note && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 bg-slate-50 p-2 sm:p-3 rounded-md">
                    {entry.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
