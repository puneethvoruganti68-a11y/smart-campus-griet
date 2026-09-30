'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAccessPage = pathname === '/staff/access';

  useEffect(() => {
    if (isAccessPage) return;
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && user?.role !== 'staff') {
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router, isAccessPage]);

  if (isAccessPage) return <>{children}</>;

  if (isLoading || !isAuthenticated || user?.role !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout role="staff">
      {children}
    </DashboardLayout>
  );
}
