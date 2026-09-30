import { NextResponse } from 'next/server';
import { database } from '@/lib/server/database';
import { getSessionUser } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'staff') return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const staff = await database.prepare(`SELECT s.id, s.staff_id, s.name, s.department_id, d.name AS departmentName
    FROM staff s JOIN departments d ON d.id = s.department_id WHERE s.id = ?`).get(user.id);
  const issueRows = await database.prepare(`SELECT i.*, d.name AS departmentName FROM issues i
    JOIN departments d ON d.id = i.department_id WHERE i.department_id = ? OR i.assigned_staff_id = ? ORDER BY i.created_at DESC`).all(user.departmentId || '', user.id) as Record<string, any>[];
  const issues = issueRows.map(issue => ({
    ...issue,
    studentId: issue.student_id,
    ticketNumber: issue.ticket_number,
    departmentId: issue.department_id,
    assignedStaffId: issue.assigned_staff_id,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    location: `${issue.building}, ${issue.floor} Floor, ${issue.room}`,
    safetyConcern: Boolean(issue.safety_concern),
    resolutionNote: issue.resolution_note,
  }));
  const counts = await database.prepare(`SELECT
    SUM(CASE WHEN assigned_staff_id = ? AND status != 'completed' THEN 1 ELSE 0 END) AS assigned,
    SUM(CASE WHEN priority IN ('high', 'critical') AND status != 'completed' THEN 1 ELSE 0 END) AS highPriority,
    SUM(CASE WHEN status IN ('accepted', 'in_progress') THEN 1 ELSE 0 END) AS inProgress,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
    FROM issues WHERE department_id = ? OR assigned_staff_id = ?`).get(user.id, user.departmentId || '', user.id);
  return NextResponse.json({ staff, issues, counts });
}