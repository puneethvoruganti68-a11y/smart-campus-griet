'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { User, Hash, Shield, Building, Activity, CheckCircle, Clock } from 'lucide-react';

export default function StaffProfile() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    if (user && user.role === 'staff') {
      fetch('/api/staff/summary').then(response => response.ok ? response.json() : null).then(data => {
        if (data) setStats({ ...data.counts, departmentName: data.staff?.departmentName });
      }).catch(() => setStats({}));
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center shadow-md">
              <User className="h-12 w-12 text-slate-500" />
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 font-medium">{stats?.departmentName || 'Department'}</p>
            </div>
            <div className="pb-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500"></div> Active
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" /> Account Info
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-2"><Hash className="h-4 w-4" /> Staff ID</span>
                  <span className="font-medium text-slate-900">{user.staffId || user.collegeId}</span>
                </li>
                <li className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-2"><Building className="h-4 w-4" /> Department</span>
                  <span className="font-medium text-slate-900">{stats?.departmentName || 'Department'}</span>
                </li>
                <li className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-2"><Shield className="h-4 w-4" /> Role</span>
                  <span className="font-medium text-slate-900">Staff Member</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400" /> Performance Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Resolved</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stats?.completed || 0}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stats?.assigned || 0}</p>
                </div>
                <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-medium uppercase tracking-wider">Avg Resolution Time</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">N/A</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
