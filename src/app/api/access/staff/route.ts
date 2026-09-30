import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/server/database';
import { setSessionCookie } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const staffId = typeof body?.staffId === 'string' ? body.staffId.trim() : '';
  const staff = await database.prepare('SELECT id, staff_id, name, department_id FROM staff WHERE staff_id = ? COLLATE NOCASE').get(staffId) as { id: string; staff_id: string; name: string; department_id: string } | undefined;
  if (!staff) return NextResponse.json({ error: 'Staff ID not recognized.' }, { status: 401 });

  const user = { id: staff.id, name: staff.name, role: 'staff' as const, collegeId: staff.staff_id, staffId: staff.staff_id, departmentId: staff.department_id };
  setSessionCookie(user);
  return NextResponse.json({ user });
}
