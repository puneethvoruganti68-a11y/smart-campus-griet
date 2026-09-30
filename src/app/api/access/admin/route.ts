import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/server/session';
import { database } from '@/lib/server/database';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const admin = database.prepare('SELECT email, password_hash FROM admins WHERE id = ?').get('central_admin') as { email: string; password_hash: string } | undefined;
  const configuredEmail = admin?.email || process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = admin?.password_hash || process.env.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !passwordHash) {
    return NextResponse.json({ error: 'Administration credentials are not configured.' }, { status: 503 });
  }
  if (email !== configuredEmail || !bcrypt.compareSync(password, passwordHash)) {
    return NextResponse.json({ error: 'Invalid administration credentials.' }, { status: 401 });
  }

  const user = { id: 'central_admin', name: process.env.ADMIN_DISPLAY_NAME || 'Administration', role: 'admin' as const, collegeId: configuredEmail };
  setSessionCookie(user);
  return NextResponse.json({ user });
}
