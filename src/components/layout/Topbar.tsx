'use client';

import React, { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (user?.role !== 'student') {
      setUnreadNotifications(0);
      return;
    }
    const refreshCount = () => fetch('/api/student/summary').then(response => response.ok ? response.json() : null)
      .then(data => setUnreadNotifications(data?.unreadNotifications || 0)).catch(() => setUnreadNotifications(0));
    refreshCount();
    window.addEventListener('campus-notifications-updated', refreshCount);
    return () => window.removeEventListener('campus-notifications-updated', refreshCount);
  }, [user]);

  const getNotificationLink = () => {
    if (user?.role === 'student') return '/student/notifications';
    if (user?.role === 'staff') return '/staff/issues?filter=priority';
    return '/admin/issues';
  };

  const getProfileLink = () => {
    if (user?.role === 'student') return '/student/dashboard';
    if (user?.role === 'staff') return '/staff/profile';
    return '/admin/settings';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white px-4 md:px-6 border-b border-slate-200 shadow-sm">
      {/* Mobile & Desktop: Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <span className="font-bold text-base text-[#1e3a5f] truncate max-w-[180px]">
            {title || 'Smart Campus'}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
            GRIET
          </span>
        </div>
        
        {/* Desktop: Title */}
        <div className="hidden md:flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">{title || 'Dashboard'}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
            {user?.role} Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <Link 
          href={getNotificationLink()} 
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          title="Notifications"
        >
          <span className="sr-only">View notifications</span>
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </Link>

        {/* User Badge / Avatar */}
        <Link 
          href={getProfileLink()} 
          className="flex items-center gap-2.5 pl-2 py-1 rounded-lg hover:bg-slate-50 transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold border border-slate-200 shadow-sm shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-primary transition-colors">
              {user?.role === 'admin' ? user.name : user?.name?.split(' ')[0] || 'User'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {user?.collegeId || 'GRIET'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
