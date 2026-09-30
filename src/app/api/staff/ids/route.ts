import { NextResponse } from 'next/server';
import { database } from '@/lib/server/database';

export const runtime = 'nodejs';

export async function GET() {
  const staff = database.prepare(`SELECT s.id, s.staff_id AS staffId, s.name, s.department_id AS departmentId, d.name AS departmentName
    FROM staff s JOIN departments d ON d.id = s.department_id ORDER BY d.name, s.staff_id`).all() as Array<{
    id: string;
    staffId: string;
    name: string;
    departmentId: string;
    departmentName: string;
  }>;

  return NextResponse.json({ staffIds: staff });
}
