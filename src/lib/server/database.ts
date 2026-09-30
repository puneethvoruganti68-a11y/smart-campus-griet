import 'server-only';

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { CATEGORY_DEPARTMENT_MAP } from '../constants';
import { DEMO_ADMIN, DEMO_STAFF } from '../demo-config';
import { IssueCategory } from '../types';

const dataDirectory = path.resolve(process.env.DATA_DIR || './data');
mkdirSync(dataDirectory, { recursive: true });

const globalForDatabase = globalThis as typeof globalThis & { campusDatabase?: Database.Database };

export const database = globalForDatabase.campusDatabase ?? new Database(
  path.join(dataDirectory, 'smart-campus.sqlite')
);

if (process.env.NODE_ENV !== 'production') globalForDatabase.campusDatabase = database;

database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');
database.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_section TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    identity_key TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department_id TEXT NOT NULL REFERENCES departments(id),
    role TEXT NOT NULL DEFAULT 'staff',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS category_mappings (
    category TEXT PRIMARY KEY,
    department_id TEXT NOT NULL REFERENCES departments(id)
  );
  CREATE TABLE IF NOT EXISTS ticket_sequence (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_value INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL REFERENCES students(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    department_id TEXT NOT NULL REFERENCES departments(id),
    building TEXT NOT NULL,
    floor TEXT NOT NULL,
    room TEXT NOT NULL,
    status TEXT NOT NULL,
    safety_concern INTEGER NOT NULL DEFAULT 0,
    assigned_staff_id TEXT REFERENCES staff(id),
    resolution_note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS issue_history (
    id TEXT PRIMARY KEY,
    issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS issues_student_created_idx ON issues(student_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS issues_department_status_idx ON issues(department_id, status);
  CREATE INDEX IF NOT EXISTS issues_priority_idx ON issues(priority);
  CREATE INDEX IF NOT EXISTS issue_history_issue_created_idx ON issue_history(issue_id, created_at);
  CREATE INDEX IF NOT EXISTS notifications_student_read_idx ON notifications(student_id, is_read, created_at DESC);
`);

database.prepare('INSERT OR IGNORE INTO ticket_sequence (id, last_value) VALUES (1, 1000)').run();

const initialDepartments = [
  ['dept_maintenance', 'Maintenance', 'General campus maintenance and repairs'],
  ['dept_electrical', 'Electrical', 'Electrical systems, wiring, and lighting'],
  ['dept_it', 'IT / AV Support', 'IT infrastructure and AV equipment'],
  ['dept_housekeeping', 'Housekeeping', 'Cleaning and campus hygiene'],
  ['dept_security', 'Security', 'Campus security and safety'],
  ['dept_transport', 'Transport', 'Campus transport and parking'],
  ['dept_admin', 'Administration', 'General administration'],
] as const;

const addDepartment = database.prepare('INSERT OR IGNORE INTO departments (id, name, description) VALUES (?, ?, ?)');
for (const department of initialDepartments) addDepartment.run(...department);

const addMapping = database.prepare('INSERT OR IGNORE INTO category_mappings (category, department_id) VALUES (?, ?)');
for (const [category, departmentId] of Object.entries(CATEGORY_DEPARTMENT_MAP)) addMapping.run(category, departmentId);

const staffId = process.env.DEV_STAFF_ID?.trim();
const staffName = process.env.DEV_STAFF_NAME?.trim();
const staffDepartmentId = process.env.DEV_STAFF_DEPARTMENT_ID?.trim();
if (staffId && staffName && staffDepartmentId && database.prepare('SELECT 1 FROM departments WHERE id = ?').get(staffDepartmentId)) {
  database.prepare(`INSERT OR IGNORE INTO staff (id, staff_id, name, department_id, role, created_at)
    VALUES (?, ?, ?, ?, 'staff', ?)`)
    .run(`staff_${staffId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, staffId, staffName, staffDepartmentId, new Date().toISOString());
}

if (!process.env.ADMIN_DISPLAY_NAME) {
  process.env.ADMIN_DISPLAY_NAME = DEMO_ADMIN.displayName;
}
if (!process.env.ADMIN_EMAIL) {
  process.env.ADMIN_EMAIL = DEMO_ADMIN.email;
}

const demoAdminHash = bcrypt.hashSync(DEMO_ADMIN.password, 10);
const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const configuredAdminHash = process.env.ADMIN_PASSWORD_HASH;
const hasAdminRecord = !!database.prepare('SELECT 1 FROM admins WHERE id = ?').get('central_admin');
if (!hasAdminRecord && configuredAdminEmail && configuredAdminHash) {
  database.prepare(`INSERT INTO admins (id, email, password_hash, role, created_at)
    VALUES ('central_admin', ?, ?, 'admin', ?)
    ON CONFLICT(id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash`)
    .run(configuredAdminEmail, configuredAdminHash, new Date().toISOString());
} else if (!hasAdminRecord) {
  database.prepare(`INSERT INTO admins (id, email, password_hash, role, created_at)
    VALUES ('central_admin', ?, ?, 'admin', ?)
    ON CONFLICT(id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash`)
    .run(DEMO_ADMIN.email.toLowerCase(), demoAdminHash, new Date().toISOString());
}

for (const staffMember of DEMO_STAFF) {
  const departmentExists = database.prepare('SELECT 1 FROM departments WHERE id = ?').get(staffMember.departmentId);
  if (!departmentExists) continue;
  database.prepare(`INSERT OR IGNORE INTO staff (id, staff_id, name, department_id, role, created_at)
    VALUES (?, ?, ?, ?, 'staff', ?)`)
    .run(staffMember.id, staffMember.staffId, staffMember.name, staffMember.departmentId, new Date().toISOString());
}

export function departmentIdForCategory(category: IssueCategory): string {
  const mapping = database.prepare('SELECT department_id FROM category_mappings WHERE category = ?').get(category) as { department_id: string } | undefined;
  return mapping?.department_id || CATEGORY_DEPARTMENT_MAP[category];
}

export function departmentName(departmentId: string): string {
  const result = database.prepare('SELECT name FROM departments WHERE id = ?').get(departmentId) as { name: string } | undefined;
  return result?.name || 'Administration';
}
