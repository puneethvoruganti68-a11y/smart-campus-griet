import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { database } from './database';

export type SessionUser = {
  id: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  collegeId: string;
  classSection?: string;
  rollNumber?: string;
  departmentId?: string;
  staffId?: string;
};

const COOKIE_NAME = 'smart_campus_session';
const sessionSecret = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'local-development-session-secret-change-me');

function sign(value: string) {
  if (!sessionSecret) throw new Error('SESSION_SECRET must be configured in production.');
  return createHmac('sha256', sessionSecret).update(value).digest('base64url');
}

export function setSessionCookie(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  cookies().set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getSessionUser(): SessionUser | null {
  const value = cookies().get(COOKIE_NAME)?.value;
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionUser;
    if (session.role === 'student') {
      const student = database.prepare('SELECT id, name, class_section, roll_number FROM students WHERE id = ?').get(session.id) as { id: string; name: string; class_section: string; roll_number: string } | undefined;
      return student ? { id: student.id, name: student.name, role: 'student', collegeId: student.roll_number, classSection: student.class_section, rollNumber: student.roll_number } : null;
    }
    if (session.role === 'staff') {
      const staff = database.prepare('SELECT id, staff_id, name, department_id FROM staff WHERE id = ?').get(session.id) as { id: string; staff_id: string; name: string; department_id: string } | undefined;
      return staff ? { id: staff.id, name: staff.name, role: 'staff', collegeId: staff.staff_id, staffId: staff.staff_id, departmentId: staff.department_id } : null;
    }
    if (session.role === 'admin' && session.id === 'central_admin') {
      return { id: 'central_admin', name: process.env.ADMIN_DISPLAY_NAME || 'Administration', role: 'admin', collegeId: process.env.ADMIN_EMAIL || 'Administration' };
    }
  } catch {
    return null;
  }
  return null;
}
