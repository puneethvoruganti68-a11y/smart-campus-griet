'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Issue, IssueHistory } from '@/lib/types';
import IssueDetailView from '@/components/issues/IssueDetailView';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [history, setHistory] = useState<IssueHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user || !params.id) return;
    fetch(`/api/issues/${encodeURIComponent(params.id)}`).then(response => response.ok ? response.json() : null).then(data => {
      if (!data?.issue) return;
      const row = data.issue;
      setIssue({
        ...row,
        id: row.id,
        studentId: row.student_id,
        ticketNumber: row.ticket_number,
        departmentId: row.department_id,
        assignedStaffId: row.assigned_staff_id,
        safetyConcern: Boolean(row.safety_concern),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        location: `${row.building}, ${row.floor} Floor, ${row.room}`,
      } as Issue);
      setHistory((data.history || []).map((item: Record<string, unknown>) => ({
        id: item.id,
        issueId: item.issue_id,
        status: item.status,
        changedBy: item.actor_name || item.changed_by,
        note: item.note,
        createdAt: item.created_at,
      } as IssueHistory)));
    }).catch(() => undefined).finally(() => setIsLoaded(true));
  }, [user, params.id]);

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Issue Not Found</h2>
        <p className="text-slate-500 text-sm">The requested issue ticket could not be found or does not belong to your account.</p>
        <Link href="/student/issues">
          <Button variant="outline">Back to My Issues</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <Link href="/student/issues" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Issues
      </Link>

      <IssueDetailView issue={issue} history={history} />
    </div>
  );
}
