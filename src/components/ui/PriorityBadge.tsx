'use client';

import React from 'react';
import { Badge } from './Badge';
import { IssuePriority } from '@/lib/types';
import { PRIORITY_CONFIG } from '@/lib/constants';
import * as Icons from 'lucide-react';

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const config = PRIORITY_CONFIG[priority];
  
  if (!config) {
    return <Badge variant="default" className={className}>{priority}</Badge>;
  }

  const IconComponent = (Icons as any)[config.icon] || Icons.AlertCircle;
  
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
