'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Repeat, AlertTriangle, ArrowRight, Building, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminRecurringIssuesPage() {
  const { user, isLoading } = useAuth();
  const [recurringIssues, setRecurringIssues] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch('/api/admin/summary?days=30').then(response => response.ok ? response.json() : null).then(data => setRecurringIssues(data?.recurringIssues || [])).catch(() => setRecurringIssues([]));
    }
  }, [user]);

  if (isLoading || !recurringIssues) {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recurring Issues</h1>
          <p className="text-slate-500 mt-1">Identify systemic problems through repeated issue reports.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-amber-50 flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">Recurring Report Patterns</h3>
            <p className="text-sm text-amber-700 mt-1">
              Patterns are based on stored reports from the last 30 days, grouped by category and exact location.
            </p>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recurringIssues.length > 0 ? (
            recurringIssues.map((item, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1">
                        <Repeat className="h-3 w-3" /> {item.reportCount} Occurrences
                      </span>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Recurring: {item.category} at {item.location}</h3>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-sm text-slate-500 bg-white border px-3 py-1.5 rounded-lg">
                    <Building className="h-4 w-4" /> {item.departmentName}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Recent Reports in this Cluster</h4>
                  <div className="space-y-3">
                    {item.recentIssueIds.map((issueId: string) => {
                      return (
                        <div key={issueId} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-slate-500">{issueId}</span>
                            <span className="font-medium text-slate-900 truncate max-w-[300px]">Report #{issueId}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Link href={`/admin/issues/${issueId}`} className="text-primary hover:underline flex items-center gap-1 text-xs font-medium">
                              View <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No recurring issues detected</h3>
              <p className="text-slate-500 mt-1">No recurring patterns detected yet. Patterns appear after multiple similar reports are submitted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
