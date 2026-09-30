'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout role="admin">
      {children}
    </DashboardLayout>
  );
}
