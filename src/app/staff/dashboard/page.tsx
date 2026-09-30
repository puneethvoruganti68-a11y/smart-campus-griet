'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Issue } from '@/lib/types';
import Link from 'next/link';
import { 
  Briefcase, AlertTriangle, Clock, CheckCircle, ChevronRight, 
  MapPin, ShieldAlert, Sparkles, UserCheck 
} from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, formatRelativeTime } from '@/lib/constants';

export default function StaffDashboard() {
  const { user, isLoading } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [departmentName, setDepartmentName] = useState('Department');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (user && user.role === 'staff') {
      fetch('/api/staff/summary').then(response => response.ok ? response.json() : null).then(data => {
        setIssues(data?.issues || []);
        setStats(data?.counts || { assigned: 0, highPriority: 0, inProgress: 0, completed: 0 });
        setDepartmentName(data?.staff?.departmentName || 'Department');
        setIsDataLoaded(true);
      }).catch(() => {
        setIssues([]);
        setStats({ assigned: 0, highPriority: 0, inProgress: 0, completed: 0 });
        setIsDataLoaded(true);
      });
    }
  }, [user]);

  if (isLoading || !isDataLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const assignedToMe = Number(stats?.assigned || 0);
  const highPriority = Number(stats?.highPriority || 0);
  const inProgress = Number(stats?.inProgress || 0);
  const completedTotal = Number(stats?.completed || 0);
  
  // Recent issues
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const deptName = departmentName;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {deptName}
            </span>
            <span className="text-xs text-slate-500 font-mono">Staff ID: {user?.collegeId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-500 text-sm">Review your assigned issues, accept new tickets, and log completions.</p>
        </div>

        <Link 
          href="/staff/issues?filter=active"
          className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Briefcase className="w-4 h-4" /> View Active Tasks
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned to Me</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{assignedToMe}</h3>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">High / Critical</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{highPriority}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{inProgress}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-100 p-3 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{completedTotal}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Attention Banner if any */}
      {highPriority > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-800">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium">
              You have <span className="font-bold">{highPriority} high-priority or critical issue(s)</span> requiring prompt resolution.
            </p>
          </div>
          <Link 
            href="/staff/issues?filter=priority" 
            className="text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Review Priority Tasks &rarr;
          </Link>
        </div>
      )}

      {/* Recent Assignments Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Department & Assigned Tasks</h2>
          <Link href="/staff/issues" className="text-xs font-semibold text-primary hover:underline flex items-center">
            View all ({issues.length}) <ChevronRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentIssues.length > 0 ? (
            recentIssues.map((issue) => {
              const statusCfg = STATUS_CONFIG[issue.status] || { label: issue.status, bgColor: '#f1f5f9', textColor: '#475569' };
              const priorityCfg = PRIORITY_CONFIG[issue.priority] || { label: issue.priority, bgColor: '#f1f5f9', textColor: '#475569' };

              return (
                <div key={issue.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{issue.ticketNumber}</span>
                      <span 
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.textColor }}
                      >
                        {statusCfg.label}
                      </span>
                      <span 
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: priorityCfg.bgColor, color: priorityCfg.textColor }}
                      >
                        {priorityCfg.label}
                      </span>
                      {issue.assignedStaffId === user?.id && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-200">
                          Assigned to you
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{issue.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{issue.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {issue.location}
                      </span>
                      <span>•</span>
                      <span>{formatRelativeTime(issue.createdAt)}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/staff/issues/${issue.id}`} 
                    className="shrink-0 px-4 py-2 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-center"
                  >
                    Manage
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              No recent assignments in your department.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
