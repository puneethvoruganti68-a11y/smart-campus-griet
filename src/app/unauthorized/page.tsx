'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
          <p className="text-sm text-slate-500 mt-2">
            You do not have the required permissions to view this section of the Smart Campus platform.
          </p>
          {user && (
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
              Current account role: <span className="capitalize font-semibold">{user.role}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={getDashboardLink()}
            className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
          <button
            onClick={() => logout()}
            className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Switch Account
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Gokaraju Rangaraju Institute of Engineering and Technology (GRIET)
        </p>
      </div>
    </div>
  );
}
