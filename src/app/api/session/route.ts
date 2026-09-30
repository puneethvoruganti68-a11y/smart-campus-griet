import { NextResponse } from 'next/server';
import { clearSessionCookie, getSessionUser } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ user: await getSessionUser() });
}

export async function DELETE() {
  clearSessionCookie();
  return NextResponse.json({ success: true });
}