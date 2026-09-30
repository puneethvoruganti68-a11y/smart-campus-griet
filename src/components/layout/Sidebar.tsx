"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  User,
  ClipboardList,
  Loader,
  CheckCircle,
  BarChart3,
  Building2,
  Users,
  RefreshCw,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
  role: UserRole;
}

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'student') {
      setUnreadNotificationCount(0);
      return;
    }
    const refreshCount = () => fetch('/api/student/summary').then(response => response.ok ? response.json() : null)
      .then(data => setUnreadNotificationCount(data?.unreadNotifications || 0)).catch(() => setUnreadNotificationCount(0));
    refreshCount();
    window.addEventListener('campus-notifications-updated', refreshCount);
    return () => window.removeEventListener('campus-notifications-updated', refreshCount);
  }, [user]);

  // Automatically collapse on smaller screens, expand on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "student":
        return [
          { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { name: "Report Issue", href: "/student/report", icon: PlusCircle },
          { name: "My Issues", href: "/student/issues", icon: FileText },
          { name: "Notifications", href: "/student/notifications", icon: Bell },
        ];
      case "staff":
        return [
          { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
          { name: "Assigned Issues", href: "/staff/issues", icon: ClipboardList },
          { name: "In Progress", href: "/staff/issues?filter=in_progress", icon: Loader },
          { name: "Completed", href: "/staff/issues?filter=completed", icon: CheckCircle },
          { name: "Profile", href: "/staff/profile", icon: User },
        ];
      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "All Issues", href: "/admin/issues", icon: FileText },
          { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
          { name: "Departments", href: "/admin/departments", icon: Building2 },
          { name: "Staff", href: "/admin/staff", icon: Users },
          { name: "Recurring Issues", href: "/admin/recurring-issues", icon: RefreshCw },
          { name: "Settings", href: "/admin/settings", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems().map((item) => {
    if (item.name === 'Notifications' && user) {
      return { ...item, badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined };
    }
    return item;
  });

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#1e3a5f] text-white transition-all duration-300 ease-in-out border-r border-slate-700 h-screen sticky top-0 z-40 ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
        <Link href={`/${role.toLowerCase()}/dashboard`} className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-400" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold text-sm tracking-wide">SMART CAMPUS</span>
              <span className="text-xs text-blue-300">GRIET</span>
            </div>
          )}
        </Link>
        
        {/* Toggle Button for desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden xl:flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-700/50 text-slate-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== `/${role.toLowerCase()}/dashboard`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group relative ${
                isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"}`}
              />
              {!isCollapsed && (
                <span className="ml-3 font-medium text-sm whitespace-nowrap flex-1">
                  {item.name}
                </span>
              )}
              
              {/* Badge */}
              {item.badge && !isCollapsed && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                  {item.badge}
                </span>
              )}
              {item.badge && isCollapsed && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Info / Logout */}
      <div className="p-4 border-t border-slate-700/50">
        {user ? (
          <div className="flex flex-col gap-3">
            {!isCollapsed && (
              <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-white truncate">{user.name}</span>
                  <span className="text-xs text-slate-400 truncate">
                    {user.role === 'student' ? `${user.classSection} · ${user.rollNumber}` : user.role === 'staff' ? user.staffId : user.collegeId}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className={`flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors ${isCollapsed ? 'px-0' : ''}`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut size={18} className={!isCollapsed ? "mr-2" : ""} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        ) : (
          <div className="h-10"></div>
        )}
      </div>
    </aside>
  );
}
