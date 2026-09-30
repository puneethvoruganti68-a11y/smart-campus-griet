import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/server/database';
import { getSessionUser } from '@/lib/server/session';
import { CATEGORY_CONFIG } from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Administration access required.' }, { status: 403 });
  const departments = await database.prepare('SELECT id, name, description FROM departments ORDER BY name').all();
  const mappings = Object.fromEntries((await database.prepare('SELECT category, department_id FROM category_mappings').all()).map((row: any) => [row.category, row.department_id]));
  return NextResponse.json({ departments, mappings, categories: Object.keys(CATEGORY_CONFIG) });
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Administration access required.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body?.mappings || typeof body.mappings !== 'object') return NextResponse.json({ error: 'Mappings are required.' }, { status: 400 });
  try {
    await database.transaction(async transaction => {
      const update = transaction.prepare('INSERT INTO category_mappings (category, department_id) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET department_id = excluded.department_id');
      for (const [category, departmentId] of Object.entries(body.mappings)) {
        if (!(category in CATEGORY_CONFIG) || typeof departmentId !== 'string' || !await transaction.prepare('SELECT 1 FROM departments WHERE id = ?').get(departmentId)) throw new Error('Invalid category mapping.');
        await update.run(category, departmentId);
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save mappings.' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}