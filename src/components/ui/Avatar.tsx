'use client';

import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string | null;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

// Generate a consistent color based on the name string
const generateColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-red-600', 'bg-orange-600', 'bg-amber-600', 'bg-green-600', 
    'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-blue-600', 
    'bg-indigo-600', 'bg-violet-600', 'bg-purple-600', 'bg-fuchsia-600', 
    'bg-pink-600', 'bg-rose-600'
  ];
  
  // Make sure index is always positive
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = '', name, src, size = 'md', ...props }, ref) => {
    const bgColor = generateColor(name);
    
    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 ${sizeClasses[size]} ${bgColor} ${className}`}
        {...props}
      >
        {src ? (
          <img 
            src={src} 
            alt={`Avatar for ${name}`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.querySelector('span')?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        <span 
          className={`font-medium text-white ${src ? 'hidden' : ''}`}
          aria-label={`Initials for ${name}`}
        >
          {getInitials(name)}
        </span>
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
