"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Issue } from '@/lib/types';
import IssueCard from '@/components/issues/IssueCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function MyIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (user) fetch('/api/issues').then(response => response.ok ? response.json() : { issues: [] }).then(data => setIssues(data.issues || [])).catch(() => setIssues([]));
  }, [user]);

  if (!user) return null;

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) || 
                          issue.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
                          issue.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Issues</h1>
          <p className="text-slate-500">Track and manage your reported campus issues.</p>
        </div>
        <Link href="/student/report">
          <Button>Report New Issue</Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            className="pl-10 w-full"
            placeholder="Search by Ticket #, title, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'reported', label: 'Reported' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' }
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' }
            ]}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map(issue => (
            <IssueCard 
              key={issue.id} 
              issue={issue} 
              href={`/student/issues/${issue.id}`}
            />
          ))
        ) : (
          <div className="py-12 bg-white rounded-xl shadow-sm border border-slate-100">
            <EmptyState
              icon={FileText}
              title="No issues found"
              description={issues.length === 0 ? "You haven't reported any issues yet." : "No issues match your current filters."}
              action={issues.length === 0 ? <Link href="/student/report"><Button>Report an Issue</Button></Link> : <Button variant="outline" onClick={() => {setSearch(''); setStatusFilter('all'); setPriorityFilter('all');}}>Clear Filters</Button>}
            />
          </div>
        )}
      </div>
    </div>
  );
}
