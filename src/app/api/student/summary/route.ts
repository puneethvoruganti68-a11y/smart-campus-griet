import { NextResponse } from 'next/server';
import { database } from '@/lib/server/database';
import { getSessionUser } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'student') return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
  const issues = await database.prepare(`SELECT i.*, d.name AS department FROM issues i
    LEFT JOIN departments d ON d.id = i.department_id
    WHERE i.student_id = ? ORDER BY i.created_at DESC LIMIT 8`).all(user.id) as Record<string, unknown>[];
  const counts = await database.prepare(`SELECT
    SUM(CASE WHEN status IN ('reported', 'assigned', 'accepted') THEN 1 ELSE 0 END) AS open,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS resolved,
    SUM(CASE WHEN priority IN ('high', 'critical') AND status != 'completed' THEN 1 ELSE 0 END) AS high_priority
    FROM issues WHERE student_id = ?`).get(user.id);
  const unread = await database.prepare('SELECT COUNT(*) AS count FROM notifications WHERE student_id = ? AND is_read = 0').get(user.id) as { count: number };
  const recentIssues = issues.map(issue => ({
    ...issue,
    departmentName: issue.department,
    studentId: issue.student_id,
    ticketNumber: issue.ticket_number,
    departmentId: issue.department_id,
    assignedStaffId: issue.assigned_staff_id,
    safetyConcern: Boolean(issue.safety_concern),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    location: `${issue.building}, ${issue.floor} Floor, ${issue.room}`,
  }));
  return NextResponse.json({ issues: recentIssues, counts, unreadNotifications: unread.count });
}