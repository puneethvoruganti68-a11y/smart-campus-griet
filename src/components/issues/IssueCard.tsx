'use client';

import React from 'react';
import { Issue } from '@/lib/types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG, formatRelativeTime } from '@/lib/constants';
import { MapPin, Clock, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface IssueCardProps {
  issue: Issue;
  compact?: boolean;
  showDetailsAction?: boolean;
  onClick?: (id: string) => void;
  href?: string;
}

export default function IssueCard({ issue, compact = false, showDetailsAction = false, onClick, href }: IssueCardProps) {
  const categoryConfig = CATEGORY_CONFIG[issue.category];
  const priorityConfig = PRIORITY_CONFIG[issue.priority];
  const statusConfig = STATUS_CONFIG[issue.status];
  
  const extendedIssue = issue as Issue & { departmentName?: string; department?: string; assignedStaffName?: string };
  const departmentName = extendedIssue.departmentName || extendedIssue.department || 'Department';

  const isCritical = issue.priority === 'critical';

  const cardContent = (
    <div className={`
      bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden
      hover:shadow-md transition-shadow duration-200 cursor-pointer
      ${isCritical ? 'border-l-4 border-l-red-500' : ''}
      ${compact ? 'p-3' : 'p-4 sm:p-5'}
    `} onClick={() => onClick && onClick(issue.id)}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500">{issue.ticketNumber}</span>
            <span 
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }}
            >
              {statusConfig.label}
            </span>
            <span 
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: priorityConfig.bgColor, color: priorityConfig.textColor }}
            >
              {priorityConfig.label} Priority
            </span>
          </div>
          
          <h3 className={`font-semibold text-slate-900 truncate mb-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {issue.title}
          </h3>
          
          {!compact && issue.description.trim() !== issue.title.trim() && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
              {issue.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{issue.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{departmentName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatRelativeTime(issue.createdAt)}</span>
            </div>
          </div>
        </div>

        {!compact && (
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 min-w-[120px]">
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
              style={{ backgroundColor: categoryConfig.bgColor, color: categoryConfig.color }}
            >
              <span>{categoryConfig.label}</span>
            </div>
            
            {extendedIssue.assignedStaffName && (
              <div className="text-xs text-slate-500 text-right">
                <span className="block text-slate-400">Assigned to</span>
                <span className="font-medium text-slate-700">{extendedIssue.assignedStaffName}</span>
              </div>
            )}

            {showDetailsAction && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                View details <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
