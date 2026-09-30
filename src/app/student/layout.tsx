'use client';

import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAccessPage = pathname === '/student/access';

  useEffect(() => {
    if (isAccessPage) return;
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (!isLoading && user?.role !== 'student') {
      router.push('/unauthorized');
    }
  }, [user, isLoading, router, isAccessPage]);

  if (isAccessPage) return <>{children}</>;

  if (isLoading || !user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout role="student">
      {children}
    </DashboardLayout>
  );
}
