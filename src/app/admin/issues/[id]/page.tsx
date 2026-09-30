'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Issue, IssueHistory } from '@/lib/types';
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, formatDateTime } from '@/lib/constants';
import { 
  ArrowLeft, Clock, AlertTriangle, MessageSquare, Briefcase, 
  FileText, Settings, User, CheckCircle2, MapPin, Building, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function AdminIssueDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const issueId = typeof params.id === 'string' ? params.id : '';
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [history, setHistory] = useState<IssueHistory[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [note, setNote] = useState('');
  
  // Reassignment state
  const [showReassign, setShowReassign] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  useEffect(() => {
    if (issueId) {
      fetch(`/api/issues/${encodeURIComponent(issueId)}`).then(response => response.ok ? response.json() : null).then(data => {
        if (!data?.issue) { setIssue(null); return; }
        const row = data.issue;
        setIssue({ ...row, studentId: row.student_id, ticketNumber: row.ticket_number, departmentId: row.department_id, assignedStaffId: row.assigned_staff_id, createdAt: row.created_at, updatedAt: row.updated_at, location: `${row.building}, ${row.floor} Floor, ${row.room}`, safetyConcern: Boolean(row.safety_concern), resolutionNote: row.resolution_note, departmentName: row.department_name, studentName: row.student_name, studentRollNumber: row.roll_number, assignedStaffName: row.assigned_staff_name } as Issue);
        setHistory((data.history || []).map((item: Record<string, any>) => ({ id: item.id, issueId: item.issue_id, status: item.status, changedBy: item.actor_name || item.changed_by, note: item.note, createdAt: item.created_at })));
        setSelectedDept(row.department_id);
        setSelectedStaff(row.assigned_staff_id || '');
      }).catch(() => setIssue(null));
      fetch('/api/admin/meta').then(response => response.ok ? response.json() : { departments: [], staff: [] }).then(data => {
        setDepartments(data.departments || []);
        setStaff(data.staff || []);
      });
    }
  }, [issueId, refreshKey]);
  
  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-slate-700">Issue not found</h2>
        <Link href="/admin/issues" className="text-primary hover:underline">Return to issues list</Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[issue.status] || {
    label: issue.status,
    bgColor: '#f1f5f9',
    textColor: '#475569',
  };

  const priorityConfig = PRIORITY_CONFIG[issue.priority] || {
    label: issue.priority,
    bgColor: '#f1f5f9',
    textColor: '#475569',
  };

  const categoryConfig = CATEGORY_CONFIG[issue.category] || {
    label: issue.category,
    color: '#64748b',
    bgColor: '#f8fafc',
  };

  const handleAdminAction = async (action: string) => {
    if (!user) return;
    const status = action === 'CLOSE' ? 'completed' : issue.status;
    const actionNote = note || (action === 'CLOSE' ? 'Administratively closed.' : action === 'ESCALATE' ? 'Issue escalated for senior facility review.' : 'Administrative note added.');
    const response = await fetch(`/api/issues/${encodeURIComponent(issue.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, note: actionNote }) });
    if (!response.ok) return;
    setNote('');
    setRefreshKey(prev => prev + 1);
  };
  
  const handleReassign = async () => {
    if (!user || !selectedDept) return;
    const response = await fetch(`/api/issues/${encodeURIComponent(issue.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ departmentId: selectedDept, staffId: selectedStaff }) });
    if (!response.ok) return;
    setShowReassign(false);
    setRefreshKey(prev => prev + 1);
  };

  const issueDetails = issue as Issue & { studentName?: string; studentRollNumber?: string; departmentName?: string; assignedStaffName?: string };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <Link href="/admin/issues" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Issues
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold">{issue.ticketNumber}</span>
              <span 
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }}
              >
                {statusConfig.label}
              </span>
              <span 
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: priorityConfig.bgColor, color: priorityConfig.textColor }}
              >
                {priorityConfig.label} Priority
              </span>
              <span 
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: categoryConfig.bgColor, color: categoryConfig.color }}
              >
                {categoryConfig.label}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{issue.title}</h1>
            <p className="text-slate-500 flex items-center gap-2 mt-2 text-sm">
              <Clock className="h-4 w-4" /> Reported on {formatDateTime(issue.createdAt)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowReassign(!showReassign)} 
              className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              Reassign Issue
            </button>
            {issue.status !== 'completed' && (
              <button 
                onClick={() => handleAdminAction('CLOSE')} 
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                Force Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {showReassign && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Reassign Department / Staff</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select 
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-primary"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign Staff Member</label>
              <select 
                value={selectedStaff} 
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Unassigned (Department Queue) --</option>
                {staff.filter(member => member.departmentId === selectedDept).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.staffId})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowReassign(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
            <button onClick={handleReassign} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Save Assignment</button>
          </div>
        </div>
      )}

      {issue.safetyConcern && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Critical Safety Alert</h4>
            <p className="text-sm text-red-700">This issue has been marked as a high-priority safety risk requiring urgent campus response.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2 text-slate-900">
              <FileText className="h-5 w-5 text-slate-400" /> Description & Location
            </h2>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap mb-4">
              {issue.description}
            </div>
            
            {issue.imageUrl && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Attached Image</span>
                <div className="rounded-lg overflow-hidden border border-slate-200 max-w-md max-h-80 bg-slate-100">
                  <img src={issue.imageUrl} alt="Issue attachment" className="w-full h-auto object-cover" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2 text-slate-900">
              <Settings className="h-5 w-5 text-slate-400" /> Administrative Action & Notes
            </h2>
            <div className="space-y-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an administrative note, escalation summary, or directive for staff..."
                className="w-full min-h-[100px] p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm text-slate-900"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAdminAction('NOTE')} 
                  disabled={!note.trim()}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Add Admin Note
                </button>
                <button 
                  onClick={() => handleAdminAction('ESCALATE')} 
                  className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  Escalate
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-slate-900">Lifecycle Audit Trail</h2>
            <div className="space-y-6">
              {history.map((item, idx) => {
                const userName = item.changedBy;
                const itemStatusConfig = STATUS_CONFIG[item.status] || { label: item.status, color: '#64748b' };
                
                return (
                  <div key={item.id} className="relative flex gap-4">
                    {idx !== history.length - 1 && <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-slate-200" />}
                    <div 
                      className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm shrink-0"
                      style={{ backgroundColor: itemStatusConfig.color }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="text-sm font-semibold text-slate-900">
                          Status: <span style={{ color: itemStatusConfig.color }}>{itemStatusConfig.label}</span>
                          <span className="text-xs text-slate-500 ml-2 font-normal">by {userName}</span>
                        </p>
                        <time className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</time>
                      </div>
                      {item.note && (
                        <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-slate-400" /> Routing Details
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-500 mb-1">Department</dt>
                <dd className="font-semibold text-slate-900">{issueDetails.departmentName || 'Department'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Category</dt>
                <dd className="font-semibold text-slate-900">{categoryConfig.label}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Assigned Staff</dt>
                <dd className="font-semibold text-slate-900">
                  {issueDetails.assignedStaffName ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span>{issueDetails.assignedStaffName}</span>
                    </div>
                  ) : (
                    <span className="text-amber-600 font-medium">Unassigned (Pool)</span>
                  )}
                </dd>
              </div>
              {issue.resolutionNote && (
                <div className="pt-3 border-t border-slate-100">
                  <dt className="text-slate-500 mb-1 font-semibold text-green-700">Resolution Note</dt>
                  <dd className="font-medium text-slate-800 bg-green-50 p-2.5 rounded-lg border border-green-200">
                    {issue.resolutionNote}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" /> Reporter Info
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-500 mb-1">Reported By</dt>
                <dd className="font-semibold text-slate-900">{issueDetails.studentName || 'Student'}</dd>
                <dd className="text-xs text-slate-400">{issueDetails.studentRollNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Roll Number</dt>
                <dd className="font-mono text-slate-700">{issueDetails.studentRollNumber || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Location</dt>
                <dd className="font-medium text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {issue.location || `${issue.building}, ${issue.room}`}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
