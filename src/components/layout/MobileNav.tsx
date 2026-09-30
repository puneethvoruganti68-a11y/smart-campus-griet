"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  FileText,
  Bell,
  User,
  ClipboardList,
  CheckCircle,
  BarChart3,
  Users,
  Menu,
  X,
  Building2,
  RefreshCw,
  Settings,
  LogOut
} from "lucide-react";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  emphasized?: boolean;
  badge?: number;
  action?: () => void;
}

interface MobileNavProps {
  role: UserRole;
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'student') {
      setUnreadCount(0);
      return;
    }
    const refreshCount = () => fetch('/api/student/summary').then(response => response.ok ? response.json() : null)
      .then(data => setUnreadCount(data?.unreadNotifications || 0)).catch(() => setUnreadCount(0));
    refreshCount();
    window.addEventListener('campus-notifications-updated', refreshCount);
    return () => window.removeEventListener('campus-notifications-updated', refreshCount);
  }, [user]);

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "student":
        return [
          { name: "Home", href: "/student/dashboard", icon: Home },
          { name: "Issues", href: "/student/issues", icon: FileText },
          { name: "Report", href: "/student/report", icon: PlusCircle, emphasized: true },
          { name: "Alerts", href: "/student/notifications", icon: Bell, badge: unreadCount || undefined },
        ];
      case "staff":
        return [
          { name: "Home", href: "/staff/dashboard", icon: Home },
          { name: "Assigned", href: "/staff/issues", icon: ClipboardList },
          { name: "In Progress", href: "/staff/issues?filter=in_progress", icon: ClipboardList },
          { name: "Done", href: "/staff/issues?filter=completed", icon: CheckCircle },
          { name: "Profile", href: "/staff/profile", icon: User },
        ];
      case "admin":
        return [
          { name: "Home", href: "/admin/dashboard", icon: Home },
          { name: "Issues", href: "/admin/issues", icon: FileText },
          { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
          { name: "Staff", href: "/admin/staff", icon: Users },
          { name: "More", href: "#", icon: Menu, action: () => setDrawerOpen(true) },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const adminDrawerItems = [
    { name: "Departments", href: "/admin/departments", icon: Building2 },
    { name: "Recurring", href: "/admin/recurring", icon: RefreshCw },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
        <nav className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== `/${role.toLowerCase()}/dashboard` && item.name !== "Home");
            
            if (item.action) {
              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-slate-900"
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </button>
              );
            }

            if (item.emphasized) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative -top-5 flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border-4 border-white">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-700 mt-1">{item.name}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-6 h-6 ${isActive ? 'fill-blue-50' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      {/* Optional text inside small badge */}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin More Drawer */}
      {role === "admin" && (
        <div 
          className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Drawer Content */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 pb-safe ${
              drawerOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">More Options</h3>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {adminDrawerItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium text-slate-700">{item.name}</span>
                </Link>
              ))}
              
              <div className="my-2 border-t border-slate-100" />
              
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="flex items-center gap-4 p-3 w-full rounded-xl hover:bg-red-50 text-red-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <LogOut size={20} />
                </div>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
