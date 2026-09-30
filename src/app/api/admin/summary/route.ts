import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/server/database';
import { getSessionUser } from '@/lib/server/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Administration access required.' }, { status: 403 });
  const days = Math.max(1, Math.min(365, Number(request.nextUrl.searchParams.get('days') || 30)));
  const metrics = database.prepare(`SELECT COUNT(*) AS totalIssues,
    SUM(CASE WHEN status IN ('reported', 'assigned', 'accepted') THEN 1 ELSE 0 END) AS openIssues,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgressIssues,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedIssues,
    SUM(CASE WHEN priority IN ('high', 'critical') AND status != 'completed' THEN 1 ELSE 0 END) AS criticalIssues
    FROM issues`).get() as Record<string, number | null>;
  const categoryDist = database.prepare(`SELECT category, COUNT(*) AS count FROM issues GROUP BY category ORDER BY count DESC`).all();
  const priorityDist = database.prepare(`SELECT priority, COUNT(*) AS count FROM issues GROUP BY priority`).all();
  const deptWorkload = database.prepare(`SELECT d.name AS departmentName,
    SUM(CASE WHEN i.status != 'completed' THEN 1 ELSE 0 END) AS active,
    SUM(CASE WHEN i.status = 'completed' THEN 1 ELSE 0 END) AS resolved
    FROM departments d LEFT JOIN issues i ON i.department_id = d.id GROUP BY d.id ORDER BY d.name`).all();
  const trendRows = database.prepare(`SELECT date(created_at) AS day,
    SUM(CASE WHEN event = 'created' THEN 1 ELSE 0 END) AS created,
    SUM(CASE WHEN event = 'resolved' THEN 1 ELSE 0 END) AS resolved FROM (
      SELECT created_at, 'created' AS event FROM issues WHERE created_at >= date('now', ?)
      UNION ALL SELECT updated_at, 'resolved' AS event FROM issues WHERE status = 'completed' AND updated_at >= date('now', ?)
    ) GROUP BY day ORDER BY day`).all(`-${days} days`, `-${days} days`) as { day: string; created: number; resolved: number }[];
  const trendMap = new Map(trendRows.map(row => [row.day, row]));
  const trends = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    const row = trendMap.get(key);
    return { date: key.slice(5), created: row?.created || 0, resolved: row?.resolved || 0 };
  });
  const recentIssues = database.prepare(`SELECT i.*, d.name AS departmentName FROM issues i
    LEFT JOIN departments d ON d.id = i.department_id ORDER BY created_at DESC LIMIT 6`).all() as Record<string, unknown>[];
  const recurringIssues = database.prepare(`SELECT issues.building, issues.floor, issues.room, issues.category,
    issues.department_id AS departmentId, d.name AS departmentName, COUNT(*) AS reportCount,
    GROUP_CONCAT(issues.id) AS issueIds FROM issues JOIN departments d ON d.id = issues.department_id
    WHERE issues.created_at >= datetime('now', '-30 days')
    GROUP BY issues.building, issues.floor, issues.room, issues.category, issues.department_id HAVING COUNT(*) >= 2 ORDER BY reportCount DESC`).all() as Record<string, unknown>[];
  const departmentMap = new Map((deptWorkload as { departmentName: string; active: number; resolved: number }[]).map(item => [item.departmentName, item]));
  const namedCategories = (categoryDist as { category: string; count: number }[]).map(item => ({ ...item, name: item.category, label: item.category.replace('_', ' ') }));
  const critical = Number(metrics.criticalIssues || 0);
  const completed = Number(metrics.completedIssues || 0);
  const total = Number(metrics.totalIssues || 0);
  return NextResponse.json({
    metrics: { ...metrics, totalIssues: total, openIssues: Number(metrics.openIssues || 0), inProgressIssues: Number(metrics.inProgressIssues || 0), completedIssues: completed, criticalIssues: critical, staffCount: database.prepare('SELECT COUNT(*) AS count FROM staff').get(), avgResolutionTime: 'N/A' },
    categoryDist: namedCategories,
    priorityDist: priorityDist as { priority: string; count: number }[],
    deptWorkload,
    trends,
    recentIssues: recentIssues.map(issue => ({ ...issue, ticketNumber: issue.ticket_number, departmentId: issue.department_id, createdAt: issue.created_at, safetyConcern: Boolean(issue.safety_concern), location: `${issue.building}, ${issue.floor} Floor, ${issue.room}` })),
    recurringIssues: recurringIssues.map(item => ({ ...item, location: `${item.building}, ${item.floor} Floor, Room ${item.room}`, issueType: item.category, period: '30 days', recentIssueIds: String(item.issueIds || '').split(',') })),
    resolutionRate: total ? Math.round((completed / total) * 100) : 0,
    staffCount: database.prepare('SELECT COUNT(*) AS count FROM staff').get(),
    departmentCount: departmentMap.size,
  });
}