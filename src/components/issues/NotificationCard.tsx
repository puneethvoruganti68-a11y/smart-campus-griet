'use client';

import React from 'react';
import { Notification } from '@/lib/types';
import { formatRelativeTime } from '@/lib/constants';
import { Info, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function NotificationCard({ notification, onRead, onClick }: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    if (notification.isRead) return 'bg-white';
    switch (notification.type) {
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-amber-50';
      case 'error': return 'bg-red-50';
      case 'info':
      default: return 'bg-blue-50';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (onClick && notification.issueId) {
      onClick(notification.issueId);
    }
  };

  const content = (
    <div 
      className={`
        p-4 border-b border-slate-100 transition-colors cursor-pointer
        hover:bg-slate-50 flex gap-3 items-start
        ${getBgColor()}
      `}
      onClick={handleClick}
    >
      <div className="shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notification.isRead ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
          {notification.message}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-slate-400">
            {formatRelativeTime(notification.createdAt)}
          </span>
          {notification.ticketNumber && (
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              {notification.ticketNumber}
            </span>
          )}
        </div>
      </div>
      
      {!notification.isRead && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
      )}
    </div>
  );

  if (notification.issueId && !onClick) {
    // Determine the base route based on the current URL path or a prop,
    // but for simplicity in a shared component, we rely on onClick or provide a standard link
    // Assuming staff/student specific routing happens via onClick handler in the parent
    return content;
  }

  return content;
}
