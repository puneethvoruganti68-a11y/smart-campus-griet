'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Issue } from '@/lib/types';
import Link from 'next/link';
import { Search, Filter, AlertCircle, Clock, CheckCircle, MapPin, Building, ChevronRight } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, formatRelativeTime } from '@/lib/constants';

export default function StaffIssues() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('filter') || 'all';
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (user && user.role === 'staff') {
      fetch('/api/issues').then(response => response.ok ? response.json() : { issues: [] }).then(data => {
        setIssues((data.issues || []).map((row: Record<string, any>) => ({
          ...row,
          studentId: row.student_id,
          ticketNumber: row.ticket_number,
          departmentId: row.department_id,
          assignedStaffId: row.assigned_staff_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })));
        setIsDataLoaded(true);
      }).catch(() => { setIssues([]); setIsDataLoaded(true); });
    }
  }, [user]);

  if (isLoading || !isDataLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const filteredIssues = issues.filter(issue => {
    // Status filter
    if (statusFilter === 'active' && issue.status === 'completed') return false;
    if (statusFilter === 'in_progress' && issue.status !== 'in_progress' && issue.status !== 'accepted') return false;
    if (statusFilter === 'priority' && issue.priority !== 'high' && issue.priority !== 'critical') return false;
    if (statusFilter === 'completed' && issue.status !== 'completed') return false;
    if (statusFilter === 'assigned' && issue.assignedStaffId !== user?.id) return false;
    
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = 
        issue.title.toLowerCase().includes(q) || 
        issue.ticketNumber.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.location.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Department Tasks & Queue</h1>
          <p className="text-slate-500 mt-1">Review, accept, update, and resolve campus issues.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by ticket #, issue title, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-slate-900"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Link href="/staff/issues?filter=all" className={`px-3.5 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            All ({issues.length})
          </Link>
          <Link href="/staff/issues?filter=active" className={`px-3.5 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${statusFilter === 'active' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Active ({issues.filter(i => i.status !== 'completed').length})
          </Link>
          <Link href="/staff/issues?filter=priority" className={`px-3.5 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${statusFilter === 'priority' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            High / Critical ({issues.filter(i => (i.priority === 'high' || i.priority === 'critical') && i.status !== 'completed').length})
          </Link>
          <Link href="/staff/issues?filter=completed" className={`px-3.5 py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-colors ${statusFilter === 'completed' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Completed ({issues.filter(i => i.status === 'completed').length})
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map(issue => {
            const statusCfg = STATUS_CONFIG[issue.status] || { label: issue.status, bgColor: '#f1f5f9', textColor: '#475569' };
            const priorityCfg = PRIORITY_CONFIG[issue.priority] || { label: issue.priority, bgColor: '#f1f5f9', textColor: '#475569' };
            const isAssignedToMe = issue.assignedStaffId === user?.id;

            return (
              <div 
                key={issue.id} 
                className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all ${
                  issue.priority === 'critical' ? 'border-l-4 border-l-red-500 border-slate-200' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {issue.ticketNumber}
                      </span>
                      <span 
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.textColor }}
                      >
                        {statusCfg.label}
                      </span>
                      <span 
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: priorityCfg.bgColor, color: priorityCfg.textColor }}
                      >
                        {priorityCfg.label}
                      </span>
                      {isAssignedToMe ? (
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          Assigned to you
                        </span>
                      ) : (
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Department Queue
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 truncate">{issue.title}</h3>
                    <p className="text-slate-500 mt-1 line-clamp-2 text-sm">{issue.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {issue.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatRelativeTime(issue.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                    <Link 
                      href={`/staff/issues/${issue.id}`} 
                      className="w-full md:w-auto px-4 py-2.5 bg-primary text-white text-center rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>Manage Task</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No matching tasks</h3>
            <p className="text-slate-500 text-sm">There are no tasks matching your current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
