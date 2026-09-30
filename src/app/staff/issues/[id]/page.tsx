'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Issue, IssueHistory } from '@/lib/types';
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, formatDateTime } from '@/lib/constants';
import { 
  ArrowLeft, Clock, MessageSquare, AlertCircle, CheckCircle, 
  FileText, User, MapPin, Building, CheckCircle2, Play, CheckSquare, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function StaffIssueDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const issueId = typeof params.id === 'string' ? params.id : '';
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [history, setHistory] = useState<IssueHistory[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [note, setNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeError, setCompleteError] = useState('');
  
  useEffect(() => {
    if (issueId) {
      fetch(`/api/issues/${encodeURIComponent(issueId)}`).then(response => response.ok ? response.json() : null).then(data => {
        if (!data?.issue) { setIssue(null); return; }
        const row = data.issue;
        setIssue({ ...row, studentId: row.student_id, ticketNumber: row.ticket_number, departmentId: row.department_id, assignedStaffId: row.assigned_staff_id, createdAt: row.created_at, updatedAt: row.updated_at, location: `${row.building}, ${row.floor} Floor, ${row.room}`, safetyConcern: Boolean(row.safety_concern), resolutionNote: row.resolution_note, studentName: row.student_name, studentRollNumber: row.roll_number, departmentName: row.department_name } as Issue);
        setHistory((data.history || []).map((item: Record<string, any>) => ({ id: item.id, issueId: item.issue_id, status: item.status, changedBy: item.actor_name || item.changed_by, note: item.note, createdAt: item.created_at })));
      }).catch(() => setIssue(null));
    }
  }, [issueId, refreshKey]);

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-slate-700">Issue not found</h2>
        <Link href="/staff/issues" className="text-primary hover:underline">Return to tasks list</Link>
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

  const handleStatusUpdate = async (newStatus: any, actionNote?: string) => {
    if (!user) return;
    const response = await fetch(`/api/issues/${encodeURIComponent(issue.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note: actionNote || note }),
    });
    if (!response.ok) return;
    setNote('');
    setRefreshKey(prev => prev + 1);
  };

  const handleAccept = () => {
    if (!user) return;
    handleStatusUpdate('accepted', `Task accepted by ${user.name}`);
  };

  const handleStartWork = () => {
    if (!user) return;
    handleStatusUpdate('in_progress', `Work commenced by ${user.name}`);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      setCompleteError('Please provide a resolution note detailing the fix.');
      return;
    }
    if (!user) return;

    handleStatusUpdate('completed', `Issue resolved: ${resolutionNote.trim()}`);
    setShowCompleteModal(false);
    setResolutionNote('');
  };

  const reporter = issue as Issue & { studentName?: string; studentRollNumber?: string; departmentName?: string };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link href="/staff/issues" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Tasks
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
          
          {/* Action Buttons based on status */}
          <div className="flex flex-wrap items-center gap-2">
            {(issue.status === 'reported' || issue.status === 'assigned') && (
              <button 
                onClick={handleAccept} 
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckSquare className="w-4 h-4" /> Accept Task
              </button>
            )}

            {issue.status === 'accepted' && (
              <button 
                onClick={handleStartWork} 
                className="px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Start Work
              </button>
            )}

            {issue.status === 'in_progress' && (
              <button 
                onClick={() => setShowCompleteModal(true)} 
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Mark Completed
              </button>
            )}

            {issue.status === 'completed' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-green-600" /> Resolved
              </span>
            )}
          </div>
        </div>
      </div>

      {issue.safetyConcern && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Campus Safety Hazard</h4>
            <p className="text-sm text-red-700">Immediate attention recommended for campus hazard mitigation.</p>
          </div>
        </div>
      )}

      {/* Complete Issue Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Resolve & Complete Issue</h3>
                <p className="text-xs text-slate-500">Provide resolution notes for the student and administration.</p>
              </div>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Resolution Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => {
                    setResolutionNote(e.target.value);
                    setCompleteError('');
                  }}
                  placeholder="e.g. Replaced leaking valve and tested pressure. Area cleaned and dried."
                  className="w-full min-h-[100px] p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm text-slate-900"
                  required
                />
                {completeError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{completeError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2 text-slate-900">
              <FileText className="h-5 w-5 text-slate-400" /> Description & Location
            </h2>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap mb-4">
              {issue.description}
            </div>

            {issue.imageUrl && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Student Photo</span>
                <div className="rounded-lg overflow-hidden border border-slate-200 max-w-md max-h-80 bg-slate-100">
                  <img src={issue.imageUrl} alt="Student attachment" className="w-full h-auto object-cover" />
                </div>
              </div>
            )}
          </div>

          {issue.status !== 'completed' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2 text-slate-900">
                <MessageSquare className="h-5 w-5 text-slate-400" /> Progress Note
              </h2>
              <div className="space-y-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a progress update, equipment needed, or internal note..."
                  className="w-full min-h-[90px] p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm text-slate-900"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(issue.status)} 
                    disabled={!note.trim()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Post Progress Note
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-slate-900">Task Timeline</h2>
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
            <h3 className="font-semibold text-slate-900 mb-4">Location & Assignment</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-500 mb-1">Location</dt>
                <dd className="font-medium text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {issue.location || `${issue.building}, ${issue.room}`}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Building</dt>
                <dd className="font-medium text-slate-900">{issue.building}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Room / Area</dt>
                <dd className="font-medium text-slate-900">{issue.room}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Department</dt>
                <dd className="font-medium text-slate-900">{reporter.departmentName || 'Department'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Reporter</dt>
                <dd className="font-medium text-slate-900">{reporter.studentName || 'Student'}</dd>
                <dd className="text-xs text-slate-400">{reporter.studentRollNumber}</dd>
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
        </div>
      </div>
    </div>
  );
}
