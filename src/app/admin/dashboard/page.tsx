'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { CHART_COLORS, STATUS_CONFIG, PRIORITY_CONFIG, formatRelativeTime } from '@/lib/constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, FileText, ArrowUpRight, Activity, Repeat, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);
  const [deptWorkload, setDeptWorkload] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [recurringIssues, setRecurringIssues] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch('/api/admin/summary?days=14').then(response => response.ok ? response.json() : null).then(data => {
      if (!data) return;
      setMetrics(data.metrics);
      setCategoryDist(data.categoryDist || []);
      setDeptWorkload(data.deptWorkload || []);
      setTrends(data.trends || []);
      setRecurringIssues(data.recurringIssues || []);
      setRecentIssues(data.recentIssues || []);
    }).catch(() => setMetrics({ totalIssues: 0, openIssues: 0, inProgressIssues: 0, completedIssues: 0, criticalIssues: 0 }));
  }, [user]);

  if (isLoading || !metrics) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Campus Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time facility intelligence, department routing, and resolution metrics.</p>
        </div>
        <Link 
          href="/admin/analytics" 
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/20 bg-primary/10 px-3.5 py-2 rounded-lg transition-colors"
        >
          <Activity className="h-4 w-4" /> Full Analytics & Reports
        </Link>
      </div>

      {/* Critical & Recurring Alerts (TOP PRIORITY HIERARCHY) */}
      {recurringIssues.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
                <Repeat className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase tracking-wider">
                    Recurring Issue Pattern Detected
                  </span>
                  <span className="text-xs text-amber-700 font-medium">Infrastructure Alert</span>
                </div>
                <h4 className="text-sm font-bold text-amber-950 mt-1">
                  {recurringIssues[0].location} — {recurringIssues[0].issueType}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  <strong className="font-semibold">{recurringIssues[0].reportCount} reports</strong> recorded in {recurringIssues[0].period}. Routing to {recurringIssues[0].departmentName}.
                </p>
              </div>
            </div>

            <Link
              href="/admin/recurring"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors self-start sm:self-center shadow-sm"
            >
              Investigate Recurring Patterns &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Reports</h3>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{metrics.totalIssues}</p>
            <span className="text-xs text-slate-400">lifetime</span>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open</h3>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{metrics.openIssues}</p>
            <span className="text-xs text-blue-600/70 font-medium">awaiting work</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</h3>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{metrics.inProgressIssues}</p>
            <span className="text-xs text-amber-600/70 font-medium">work underway</span>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">High / Critical</h3>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{metrics.criticalIssues}</p>
            <span className="text-xs text-red-600/70 font-medium">urgent attention</span>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved Rate</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              {metrics.totalIssues ? Math.round((metrics.completedIssues / metrics.totalIssues) * 100) : 0}%
            </p>
            <span className="text-xs text-green-600 font-medium">{metrics.completedIssues} fixed</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Trend Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Campus Issue Volume (14 Days)</h3>
            <span className="text-xs text-slate-400">Created vs Resolved</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="created" name="New Issues" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke={CHART_COLORS.success} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Workload */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Department Workload Distribution</h3>
            <span className="text-xs text-slate-400">Active vs Done</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptWorkload} layout="vertical" margin={{ top: 5, right: 15, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="departmentName" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="active" name="Active Issues" fill={CHART_COLORS.warning} radius={[0, 4, 4, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill={CHART_COLORS.success} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Recent Campus Reports</h3>
            <p className="text-xs text-slate-500">Live feed of student and staff reported tickets.</p>
          </div>
          <Link href="/admin/issues" className="text-xs font-semibold text-primary hover:underline flex items-center">
            View All Issues <ArrowUpRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentIssues.length === 0 && <p className="p-6 text-sm text-slate-500">No reports submitted yet.</p>}
          {recentIssues.map(issue => {
            const statusCfg = (STATUS_CONFIG as Record<string, any>)[issue.status] || { label: issue.status, bgColor: '#f1f5f9', textColor: '#475569' };
            const priorityCfg = (PRIORITY_CONFIG as Record<string, any>)[issue.priority] || { label: issue.priority, bgColor: '#f1f5f9', textColor: '#475569' };

            return (
              <div key={issue.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {issue.ticketNumber}
                    </span>
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
                    {issue.safetyConcern && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold border border-red-200">
                        Safety Alert
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{issue.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">{issue.departmentName}</span> • {issue.location} • {formatRelativeTime(issue.createdAt)}
                  </p>
                </div>
                <Link 
                  href={`/admin/issues/${issue.id}`} 
                  className="shrink-0 px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:text-slate-900 bg-white rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Inspect & Route
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
