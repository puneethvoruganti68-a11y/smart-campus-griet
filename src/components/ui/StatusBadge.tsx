'use client';

import React from 'react';
import { Badge } from './Badge';
import { IssueStatus } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/constants';
import * as Icons from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status];
  
  if (!config) {
    return <Badge variant="default" className={className}>{status}</Badge>;
  }

  const IconComponent = (Icons as any)[config.icon] || Icons.CircleDot;
  
  return (
    <Badge 
      variant="default" 
      className={className}
      style={{ backgroundColor: config.bgColor, color: config.textColor, borderColor: `${config.color}30` }}
      icon={<IconComponent className="w-3.5 h-3.5" />}
    >
      {config.label}
    </Badge>
  );
};
