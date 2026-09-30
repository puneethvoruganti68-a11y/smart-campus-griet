'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Building, Users, Activity, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDepartmentsPage() {
  const { user, isLoading } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [deptStats, setDeptStats] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      Promise.all([
        fetch('/api/admin/meta').then(response => response.ok ? response.json() : { departments: [] }),
        fetch('/api/admin/summary').then(response => response.ok ? response.json() : { deptWorkload: [] }),
      ]).then(([meta, summary]) => {
        const workload = new Map((summary.deptWorkload || []).map((item: any) => [item.departmentName, item]));
        const depts = (meta.departments || []).map((department: any) => ({ ...department, workload: workload.get(department.name) || { active: 0, resolved: 0 } }));
        setDepartments(depts);
        setDeptStats(Object.fromEntries(depts.map((department: any) => [department.id, department.workload])));
      }).catch(() => setDepartments([])).finally(() => setIsLoaded(true));
    }
  }, [user]);

  if (isLoading || !isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Departments</h1>
          <p className="text-slate-500 mt-1">Manage campus departments and view performance metrics.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const stats = deptStats[dept.id] || { openIssues: 0, completedIssues: 0, staffCount: 0, avgResolutionTime: '0h' };
          const totalStaff = dept.staffCount || 0;
          
          return (
            <div key={dept.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Building className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">{dept.id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
              </div>
              
              <div className="p-6 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase flex items-center gap-1 mb-1">
                      <Activity className="h-3 w-3" /> Active Issues
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.active || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase flex items-center gap-1 mb-1">
                      <Users className="h-3 w-3" /> Staff Members
                    </p>
                    <p className="text-2xl font-semibold text-slate-900">{stats.staffCount || totalStaff}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Resolved: <strong className="text-slate-900">{stats.resolved || 0}</strong></span>
                  <Link href={`/admin/issues`} className="text-primary font-medium hover:underline flex items-center">
                    View Issues <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
