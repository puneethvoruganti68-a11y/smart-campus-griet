'use client';

import React from 'react';
import { Badge } from './Badge';
import { IssueCategory } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/constants';
import * as Icons from 'lucide-react';

interface CategoryBadgeProps {
  category: IssueCategory;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const config = CATEGORY_CONFIG[category];
  
  if (!config) {
    return <Badge variant="default" className={className}>{category}</Badge>;
  }

  const IconComponent = (Icons as any)[config.icon] || Icons.Tag;
  
  return (
    <Badge 
      variant="default" 
      className={className}
      style={{ backgroundColor: config.bgColor, color: config.color, borderColor: `${config.color}30` }}
      icon={<IconComponent className="w-3.5 h-3.5" />}
    >
      {config.label}
    </Badge>
  );
};
