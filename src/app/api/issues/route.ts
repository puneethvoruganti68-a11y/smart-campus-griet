import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { database, departmentIdForCategory, departmentName } from '@/lib/server/database';
import { getSessionUser } from '@/lib/server/session';
import { BUILDINGS, CATEGORY_CONFIG } from '@/lib/constants';
import { IssueCategory, IssuePriority } from '@/lib/types';

export const runtime = 'nodejs';

function mapIssue(row: Record<string, unknown>) {
  const departmentId = String(row.department_id);
  return {
    ...row,
    department: departmentName(departmentId),
    departmentName: row.department_name || departmentName(departmentId),
    studentName: row.student_name,
    assignedStaffName: row.assigned_staff_name,
    location: `${row.building}, ${row.floor} Floor, ${row.room}`,
    safetyConcern: Boolean(row.safety_concern),
    assignedStaffId: row.assigned_staff_id || undefined,
    resolutionNote: row.resolution_note || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    studentId: row.student_id,
    ticketNumber: row.ticket_number,
    departmentId: row.department_id,
    building: row.building,
  };
}

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  let rows: Record<string, unknown>[];
  const select = `SELECT i.*, s.name AS student_name, s.class_section, s.roll_number, d.name AS department_name,
    st.name AS assigned_staff_name FROM issues i JOIN students s ON s.id = i.student_id
    JOIN departments d ON d.id = i.department_id LEFT JOIN staff st ON st.id = i.assigned_staff_id`;
  if (user.role === 'student') {
    rows = database.prepare(`${select} WHERE i.student_id = ? ORDER BY i.created_at DESC`).all(user.id) as Record<string, unknown>[];
  } else if (user.role === 'staff') {
    rows = database.prepare(`${select} WHERE i.department_id = ? OR i.assigned_staff_id = ? ORDER BY i.created_at DESC`).all(user.departmentId, user.id) as Record<string, unknown>[];
  } else {
    rows = database.prepare(`${select} ORDER BY i.created_at DESC`).all() as Record<string, unknown>[];
  }
  return NextResponse.json({ issues: rows.map(mapIssue) });
}

export async function POST(request: NextRequest) {
  const user = getSessionUser();
  if (!user || user.role !== 'student') return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const category = body?.category as IssueCategory;
  const priority = body?.priority as IssuePriority;
  const building = typeof body?.building === 'string' ? body.building : '';
  const floor = typeof body?.floor === 'string' ? body.floor : '';
  const room = typeof body?.room === 'string' ? body.room.trim() : '';
  const allowedFloors = ['Ground', '1st', '2nd', '3rd', '4th'];
  if (description.length < 10 || !CATEGORY_CONFIG[category] || !['low', 'medium', 'high', 'critical'].includes(priority) || !BUILDINGS.some(item => item.name === building) || !allowedFloors.includes(floor) || !room) {
    return NextResponse.json({ error: 'Complete the description and choose a valid building, floor, and room.' }, { status: 400 });
  }

  const departmentId = departmentIdForCategory(category);
  const department = database.prepare('SELECT id FROM departments WHERE id = ?').get(departmentId);
  if (!department) return NextResponse.json({ error: 'The routed department is not configured.' }, { status: 500 });

  const now = new Date().toISOString();
  const issueId = randomUUID();
  const title = typeof body?.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 120) : description.slice(0, 70);
  const assignedStaff = database.prepare('SELECT id FROM staff WHERE department_id = ? ORDER BY created_at LIMIT 1').get(departmentId) as { id: string } | undefined;
  const create = database.transaction(() => {
    const sequence = database.prepare('SELECT last_value FROM ticket_sequence WHERE id = 1').get() as { last_value: number };
    const nextTicket = sequence.last_value + 1;
    database.prepare('UPDATE ticket_sequence SET last_value = ? WHERE id = 1').run(nextTicket);
    const ticketNumber = `SC-${nextTicket}`;
    database.prepare(`INSERT INTO issues (id, ticket_number, student_id, title, description, category, priority, department_id, building, floor, room, assigned_staff_id, status, safety_concern, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reported', ?, ?, ?)`)
      .run(issueId, ticketNumber, user.id, title, description, category, priority, departmentId, building, floor, room, assignedStaff?.id || null, body?.safetyConcern ? 1 : 0, now, now);
    database.prepare('INSERT INTO issue_history (id, issue_id, status, changed_by, note, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), issueId, 'reported', user.id, 'Report submitted', now);
    database.prepare('INSERT INTO notifications (id, student_id, issue_id, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(randomUUID(), user.id, issueId, `Your issue #${ticketNumber} has been submitted successfully.`, now);
    return database.prepare('SELECT * FROM issues WHERE id = ?').get(issueId) as Record<string, unknown>;
  });

  const issue = mapIssue(create());
  return NextResponse.json({ issue }, { status: 201 });
}