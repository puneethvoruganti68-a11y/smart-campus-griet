"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Topbar from "./Topbar";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    } else if (!isLoading && isAuthenticated && user?.role !== role) {
      router.replace('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, role, router]);

  // Determine page title based on path
  const getPageTitle = () => {
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      const mainSection = pathParts[1];
      return mainSection.charAt(0).toUpperCase() + mainSection.slice(1).replace('-', ' ');
    }
    return "Dashboard";
  };

  if (!mounted || isLoading || !isAuthenticated || user?.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={getPageTitle()} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto w-full">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav role={role} />
    </div>
  );
}
