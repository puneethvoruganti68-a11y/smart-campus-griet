'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { CHART_COLORS } from '@/lib/constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Download, Calendar, Filter } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { user, isLoading } = useAuth();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);
  const [deptWorkload, setDeptWorkload] = useState<any[]>([]);
  const [priorityDist, setPriorityDist] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch(`/api/admin/summary?days=${days}`).then(response => response.ok ? response.json() : null).then(data => {
      if (!data) return;
      setMetrics(data.metrics);
      setCategoryDist(data.categoryDist || []);
      setDeptWorkload(data.deptWorkload || []);
      setPriorityDist(data.priorityDist || []);
      setTrends(data.trends || []);
    }).catch(() => setMetrics({ totalIssues: 0, completedIssues: 0, avgResolutionTime: 'N/A' }));
  }, [user, days]);

  if (isLoading || !metrics) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.success, '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500 mt-1">Deep dive into campus operations and issue resolution metrics.</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Avg Resolution Time</p>
          <h3 className="text-2xl font-bold text-slate-900">{metrics.avgResolutionTime || '4h'}</h3>
          <p className="text-xs text-green-600 flex items-center mt-1">
            No stored duration metrics yet
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Resolution Rate</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {metrics.totalIssues ? Math.round((metrics.completedIssues / metrics.totalIssues) * 100) : 0}%
          </h3>
          <p className="text-xs text-green-600 flex items-center mt-1">
            Calculated from stored issue statuses
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Issues Recorded</p>
          <h3 className="text-2xl font-bold text-slate-900">{metrics.totalIssues}</h3>
          <p className="text-xs text-slate-500 flex items-center mt-1">
            All stored reports
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Staff Records</p>
          <h3 className="text-2xl font-bold text-slate-900">{metrics.staffCount?.count || 0}</h3>
          <p className="text-xs text-slate-500 flex items-center mt-1">
            Staff records configured
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Volume */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Issue Volume Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="created" name="New Issues" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke={CHART_COLORS.success} fillOpacity={0.1} fill={CHART_COLORS.success} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Priority Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="priority"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityDist.map((entry, index) => {
                    let color = CHART_COLORS.success;
                    const p = String(entry.priority).toLowerCase();
                    if (p === 'critical') color = CHART_COLORS.danger;
                    else if (p === 'high') color = CHART_COLORS.warning;
                    else if (p === 'medium') color = CHART_COLORS.info;
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Department Performance</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptWorkload} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="departmentName" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="active" name="Active Load" stackId="a" fill={CHART_COLORS.warning} radius={[0, 0, 4, 4]} />
                <Bar dataKey="resolved" name="Resolved Capacity" stackId="a" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
