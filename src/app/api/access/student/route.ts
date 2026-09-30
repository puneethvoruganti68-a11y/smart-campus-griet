import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { database } from '@/lib/server/database';
import { setSessionCookie } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const classSection = typeof body?.classSection === 'string' ? body.classSection.trim() : '';
  const rollNumber = typeof body?.rollNumber === 'string' ? body.rollNumber.trim() : '';
  if (!name || !classSection || !rollNumber) {
    return NextResponse.json({ error: 'Name, class/section, and roll number are required.' }, { status: 400 });
  }

  const identityKey = `${classSection.toLocaleLowerCase()}|${rollNumber.toLocaleLowerCase()}`;
  const now = new Date().toISOString();
  database.prepare(`INSERT INTO students (id, name, class_section, roll_number, identity_key, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(identity_key) DO UPDATE SET name = excluded.name, class_section = excluded.class_section, roll_number = excluded.roll_number, updated_at = excluded.updated_at`)
    .run(randomUUID(), name, classSection, rollNumber, identityKey, now, now);

  const student = database.prepare('SELECT id, name, class_section, roll_number FROM students WHERE identity_key = ?').get(identityKey) as { id: string; name: string; class_section: string; roll_number: string };
  const user = { id: student.id, name: student.name, role: 'student' as const, collegeId: student.roll_number, classSection: student.class_section, rollNumber: student.roll_number };
  setSessionCookie(user);
  return NextResponse.json({ user });
}
