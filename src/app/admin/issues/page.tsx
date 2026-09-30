'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Issue } from '@/lib/types';
import Link from 'next/link';
import { Search, Filter, AlertTriangle, Eye, ChevronDown, MapPin, Building, Clock } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, formatRelativeTime, formatDateTime } from '@/lib/constants';

export default function AdminIssuesPage() {
  const { user, isLoading } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch('/api/issues').then(response => response.ok ? response.json() : { issues: [] }).then(data => setIssues((data.issues || []).map((row: Record<string, any>) => ({ ...row, studentId: row.student_id, ticketNumber: row.ticket_number, departmentId: row.department_id, assignedStaffId: row.assigned_staff_id, createdAt: row.created_at, updatedAt: row.updated_at }))));
      fetch('/api/admin/meta').then(response => response.ok ? response.json() : { departments: [] }).then(data => setDepartments(data.departments || []));
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const filteredIssues = issues.filter(issue => {
    if (statusFilter !== 'ALL' && issue.status !== statusFilter) return false;
    if (deptFilter !== 'ALL' && issue.departmentId !== deptFilter) return false;
    if (priorityFilter !== 'ALL' && issue.priority !== priorityFilter) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = 
        issue.title.toLowerCase().includes(q) || 
        issue.ticketNumber.toLowerCase().includes(q) || 
        issue.description.toLowerCase().includes(q) ||
        issue.location.toLowerCase().includes(q) ||
        issue.studentId.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Campus Issues Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time status, department routing, and tracking across all college facilities.</p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
          Total Issues: {issues.length}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by ticket #, title, room, student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-slate-900"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs sm:text-sm text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="assigned">Assigned</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs sm:text-sm text-slate-800"
            >
              <option value="ALL">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs sm:text-sm text-slate-800"
            >
              <option value="ALL">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Ticket</th>
                <th className="px-6 py-3.5 font-semibold">Issue Title</th>
                <th className="px-6 py-3.5 font-semibold">Department</th>
                <th className="px-6 py-3.5 font-semibold">Status / Priority</th>
                <th className="px-6 py-3.5 font-semibold">Location</th>
                <th className="px-6 py-3.5 font-semibold">Created</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length > 0 ? (
                filteredIssues.map(issue => {
                  const statusCfg = STATUS_CONFIG[issue.status] || { label: issue.status, bgColor: '#f1f5f9', textColor: '#475569' };
                  const priorityCfg = PRIORITY_CONFIG[issue.priority] || { label: issue.priority, bgColor: '#f1f5f9', textColor: '#475569' };

                  return (
                    <tr key={issue.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-700">
                        {issue.ticketNumber}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 max-w-[260px] truncate" title={issue.title}>
                        <div className="flex items-center gap-2">
                          {issue.safetyConcern && (
                            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" title="Safety hazard" />
                          )}
                          <span className="truncate">{issue.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {(issue as any).departmentName || 'Department'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
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
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        <span className="truncate max-w-[140px] inline-block">{issue.location}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {formatRelativeTime(issue.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/issues/${issue.id}`} 
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No campus issues found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (Converting rows to touch-friendly cards) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredIssues.length > 0 ? (
            filteredIssues.map(issue => {
              const statusCfg = STATUS_CONFIG[issue.status] || { label: issue.status, bgColor: '#f1f5f9', textColor: '#475569' };
              const priorityCfg = PRIORITY_CONFIG[issue.priority] || { label: issue.priority, bgColor: '#f1f5f9', textColor: '#475569' };

              return (
                <div key={issue.id} className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-1.5 flex-wrap items-center">
                      <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {issue.ticketNumber}
                      </span>
                      <span 
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.textColor }}
                      >
                        {statusCfg.label}
                      </span>
                      <span 
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: priorityCfg.bgColor, color: priorityCfg.textColor }}
                      >
                        {priorityCfg.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{formatRelativeTime(issue.createdAt)}</span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">{issue.title}</h3>
                  
                  <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {(issue as any).departmentName || 'Department'}
                    </span>
                    <Link 
                      href={`/admin/issues/${issue.id}`} 
                      className="text-primary font-semibold text-xs px-2.5 py-1 bg-primary/10 rounded-md"
                    >
                      Manage &rarr;
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No campus issues found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
