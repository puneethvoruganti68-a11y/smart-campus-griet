import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/server/database';
import { getSessionUser } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'student') return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
  const notifications = await database.prepare(`SELECT n.*, i.ticket_number FROM notifications n
    LEFT JOIN issues i ON i.id = n.issue_id WHERE n.student_id = ? ORDER BY n.created_at DESC`).all(user.id);
  return NextResponse.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== 'student') return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (body?.all === true) {
    await database.prepare('UPDATE notifications SET is_read = 1 WHERE student_id = ?').run(user.id);
  } else if (typeof body?.id === 'string') {
    await database.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND student_id = ?').run(body.id, user.id);
  } else {
    return NextResponse.json({ error: 'Notification ID is required.' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}