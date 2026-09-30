import { NextResponse } from 'next/server';
import { database } from '@/lib/server/database';
import { getSessionUser } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function GET() {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Administration access required.' }, { status: 403 });
  return NextResponse.json({
    departments: database.prepare(`SELECT d.id, d.name, d.description, COUNT(DISTINCT s.id) AS staffCount
      FROM departments d LEFT JOIN staff s ON s.department_id = d.id GROUP BY d.id ORDER BY d.name`).all(),
    staff: database.prepare(`SELECT s.id, s.staff_id AS staffId, s.name, s.department_id AS departmentId, s.role,
      d.name AS departmentName,
      SUM(CASE WHEN i.status != 'completed' THEN 1 ELSE 0 END) AS activeIssues,
      SUM(CASE WHEN i.status = 'completed' THEN 1 ELSE 0 END) AS completedIssues
      FROM staff s JOIN departments d ON d.id = s.department_id
      LEFT JOIN issues i ON i.assigned_staff_id = s.id GROUP BY s.id ORDER BY s.name`).all(),
  });
}