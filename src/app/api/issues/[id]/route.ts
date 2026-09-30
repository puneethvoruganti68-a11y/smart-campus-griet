import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { database } from '@/lib/server/database';
import { getSessionUser } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const issue = await database.prepare(`SELECT i.*, s.name AS student_name, s.class_section, s.roll_number, d.name AS department_name, st.name AS assigned_staff_name
    FROM issues i JOIN students s ON s.id = i.student_id JOIN departments d ON d.id = i.department_id
    LEFT JOIN staff st ON st.id = i.assigned_staff_id
    WHERE i.id = ? OR i.ticket_number = ?`).get(context.params.id, context.params.id) as (Record<string, unknown> & { id: string }) | undefined;
  if (!issue) return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });
  if (user.role === 'student' && issue.student_id !== user.id) return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });
  if (user.role === 'staff' && issue.department_id !== user.departmentId && issue.assigned_staff_id !== user.id) return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });
  const history = await database.prepare(`SELECT h.*,
    CASE WHEN h.changed_by = 'central_admin' THEN ? ELSE COALESCE(s.name, st.name, h.changed_by) END AS actor_name
    FROM issue_history h
    LEFT JOIN students s ON s.id = h.changed_by
    LEFT JOIN staff st ON st.id = h.changed_by
    WHERE h.issue_id = ? ORDER BY h.created_at`).all(process.env.ADMIN_DISPLAY_NAME || 'Administration', String(issue.id));
  return NextResponse.json({ issue, history });
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || !['staff', 'admin'].includes(user.role)) return NextResponse.json({ error: 'Staff or administration access required.' }, { status: 403 });
  const issue = await database.prepare('SELECT * FROM issues WHERE id = ?').get(context.params.id) as { id: string; student_id: string; department_id: string; assigned_staff_id?: string; status: string } | undefined;
  if (!issue) return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });
  if (user.role === 'staff' && issue.department_id !== user.departmentId && issue.assigned_staff_id !== user.id) return NextResponse.json({ error: 'This issue is outside your assigned department.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (body?.departmentId !== undefined) {
    if (user.role !== 'admin') return NextResponse.json({ error: 'Administration access required.' }, { status: 403 });
    const departmentId = typeof body.departmentId === 'string' ? body.departmentId : '';
    const staffId = typeof body.staffId === 'string' && body.staffId ? body.staffId : null;
    if (!await database.prepare('SELECT 1 FROM departments WHERE id = ?').get(departmentId)) return NextResponse.json({ error: 'Department not found.' }, { status: 400 });
    if (staffId && !await database.prepare('SELECT 1 FROM staff WHERE id = ? AND department_id = ?').get(staffId, departmentId)) return NextResponse.json({ error: 'Staff member does not belong to this department.' }, { status: 400 });
    const now = new Date().toISOString();
    const nextStatus = staffId && issue.status === 'reported' ? 'assigned' : issue.status;
    const note = `Administratively reassigned to ${departmentId}${staffId ? ` and staff ${staffId}` : ''}`;
    await database.transaction(async transaction => {
      await transaction.prepare('UPDATE issues SET department_id = ?, assigned_staff_id = ?, status = ?, updated_at = ? WHERE id = ?').run(departmentId, staffId, nextStatus, now, issue.id);
      await transaction.prepare('INSERT INTO issue_history (id, issue_id, status, changed_by, note, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(randomUUID(), issue.id, nextStatus, user.id, note, now);
      await transaction.prepare('INSERT INTO notifications (id, student_id, issue_id, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)').run(randomUUID(), issue.student_id, issue.id, `Your issue has been routed to ${departmentId}.`, now);
    });
    return NextResponse.json({ success: true });
  }
  const status = body?.status;
  const transitions: Record<string, string[]> = {
    reported: ['assigned', 'accepted'],
    assigned: ['accepted', 'in_progress'],
    accepted: ['in_progress'],
    in_progress: ['completed'],
  };
  const isProgressNote = typeof status === 'string' && status === issue.status && typeof body?.note === 'string' && body.note.trim().length > 0;
  const adminClosure = user.role === 'admin' && status === 'completed';
  if (typeof status !== 'string' || (!adminClosure && !isProgressNote && !transitions[issue.status]?.includes(status))) return NextResponse.json({ error: 'Invalid issue status transition.' }, { status: 400 });
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 2000) : '';
  if (status === 'completed' && !note) return NextResponse.json({ error: 'Add a resolution note before completing the issue.' }, { status: 400 });
  const now = new Date().toISOString();
  await database.transaction(async transaction => {
    await transaction.prepare(`UPDATE issues SET status = ?,
      resolution_note = CASE WHEN ? = 'completed' THEN ? ELSE resolution_note END,
      assigned_staff_id = CASE WHEN ? = 'accepted' AND ? = 'staff' THEN ? ELSE assigned_staff_id END,
      updated_at = ? WHERE id = ?`).run(status, status, note || null, status, user.role, user.id, now, issue.id);
    await transaction.prepare('INSERT INTO issue_history (id, issue_id, status, changed_by, note, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(randomUUID(), issue.id, status, user.id, note, now);
    await transaction.prepare('INSERT INTO notifications (id, student_id, issue_id, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)').run(randomUUID(), issue.student_id, issue.id, `Your issue status is now ${status.replace('_', ' ')}.`, now);
  });
  return NextResponse.json({ success: true });
}