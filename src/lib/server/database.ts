import 'server-only';

import { createClient, type Client, type InValue, type ResultSet, type Transaction } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { CATEGORY_DEPARTMENT_MAP } from '../constants';
import { DEMO_ADMIN, DEMO_STAFF } from '../demo-config';
import { IssueCategory } from '../types';

type DatabaseRow = Record<string, unknown>;
type Execute = (sql: string, args: InValue[]) => Promise<ResultSet>;
type Executor = {
  prepare(sql: string): {
    get(...args: InValue[]): Promise<DatabaseRow | undefined>;
    all(...args: InValue[]): Promise<DatabaseRow[]>;
    run(...args: InValue[]): Promise<void>;
  };
};

const schema = [
  `CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_section TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    identity_key TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department_id TEXT NOT NULL REFERENCES departments(id),
    role TEXT NOT NULL DEFAULT 'staff',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS category_mappings (
    category TEXT PRIMARY KEY,
    department_id TEXT NOT NULL REFERENCES departments(id)
  )`,
  `CREATE TABLE IF NOT EXISTS ticket_sequence (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_value INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS issues (
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
  )`,
  `CREATE TABLE IF NOT EXISTS issue_history (
    id TEXT PRIMARY KEY,
    issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS issues_student_created_idx ON issues(student_id, created_at DESC)',
  'CREATE INDEX IF NOT EXISTS issues_department_status_idx ON issues(department_id, status)',
  'CREATE INDEX IF NOT EXISTS issues_priority_idx ON issues(priority)',
  'CREATE INDEX IF NOT EXISTS issue_history_issue_created_idx ON issue_history(issue_id, created_at)',
  'CREATE INDEX IF NOT EXISTS notifications_student_read_idx ON notifications(student_id, is_read, created_at DESC)',
];

const initialDepartments = [
  ['dept_maintenance', 'Maintenance', 'General campus maintenance and repairs'],
  ['dept_electrical', 'Electrical', 'Electrical systems, wiring, and lighting'],
  ['dept_it', 'IT / AV Support', 'IT infrastructure and AV equipment'],
  ['dept_housekeeping', 'Housekeeping', 'Cleaning and campus hygiene'],
  ['dept_security', 'Security', 'Campus security and safety'],
  ['dept_transport', 'Transport', 'Campus transport and parking'],
  ['dept_admin', 'Administration', 'General administration'],
] as const;

const globalForLibsql = globalThis as typeof globalThis & {
  campusLibsqlClient?: Client;
  campusLibsqlInitialization?: Promise<void>;
};

function getClient(): Client {
  if (globalForLibsql.campusLibsqlClient) return globalForLibsql.campusLibsqlClient;
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!url) throw new Error('TURSO_DATABASE_URL must be configured.');
  if (!authToken && !url.startsWith('file:')) throw new Error('TURSO_AUTH_TOKEN must be configured for a remote database.');
  const options = authToken ? { url, authToken } : { url };
  globalForLibsql.campusLibsqlClient = createClient(options);
  return globalForLibsql.campusLibsqlClient;
}

function executorFor(execute: Execute): Executor {
  return {
    prepare(sql: string) {
      return {
        async get(...args: InValue[]) {
          const result = await execute(sql, args);
          return result.rows[0] as unknown as DatabaseRow | undefined;
        },
        async all(...args: InValue[]) {
          const result = await execute(sql, args);
          return result.rows as unknown as DatabaseRow[];
        },
        async run(...args: InValue[]) {
          await execute(sql, args);
        },
      };
    },
  };
}

async function initialize(client: Client): Promise<void> {
  for (const statement of schema) await client.execute(statement);

  const transaction = await client.transaction('write');
  try {
    const execute: Execute = (sql, args) => transaction.execute({ sql, args });
    const db = executorFor(execute);

    await db.prepare('INSERT INTO ticket_sequence (id, last_value) VALUES (1, 1000) ON CONFLICT DO NOTHING').run();
    const addDepartment = db.prepare('INSERT INTO departments (id, name, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING');
    for (const department of initialDepartments) await addDepartment.run(...department);

    const addMapping = db.prepare('INSERT INTO category_mappings (category, department_id) VALUES (?, ?) ON CONFLICT DO NOTHING');
    for (const [category, departmentId] of Object.entries(CATEGORY_DEPARTMENT_MAP)) await addMapping.run(category, departmentId);

    const staffId = process.env.DEV_STAFF_ID?.trim();
    const staffName = process.env.DEV_STAFF_NAME?.trim();
    const staffDepartmentId = process.env.DEV_STAFF_DEPARTMENT_ID?.trim();
    if (staffId && staffName && staffDepartmentId && await db.prepare('SELECT 1 FROM departments WHERE id = ?').get(staffDepartmentId)) {
      await db.prepare(`INSERT INTO staff (id, staff_id, name, department_id, role, created_at)
        VALUES (?, ?, ?, ?, 'staff', ?) ON CONFLICT DO NOTHING`)
        .run(`staff_${staffId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, staffId, staffName, staffDepartmentId, new Date().toISOString());
    }

    if (!process.env.ADMIN_DISPLAY_NAME) process.env.ADMIN_DISPLAY_NAME = DEMO_ADMIN.displayName;
    if (!process.env.ADMIN_EMAIL) process.env.ADMIN_EMAIL = DEMO_ADMIN.email;

    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const configuredAdminHash = process.env.ADMIN_PASSWORD_HASH;
    const hasAdminRecord = await db.prepare('SELECT 1 FROM admins WHERE id = ?').get('central_admin');
    if (!hasAdminRecord) {
      const passwordHash = configuredAdminHash || bcrypt.hashSync(DEMO_ADMIN.password, 10);
      const email = configuredAdminHash && configuredAdminEmail ? configuredAdminEmail : DEMO_ADMIN.email.toLowerCase();
      await db.prepare(`INSERT INTO admins (id, email, password_hash, role, created_at)
        VALUES ('central_admin', ?, ?, 'admin', ?)
        ON CONFLICT(id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash`)
        .run(email, passwordHash, new Date().toISOString());
    }

    for (const staffMember of DEMO_STAFF) {
      const departmentExists = await db.prepare('SELECT 1 FROM departments WHERE id = ?').get(staffMember.departmentId);
      if (!departmentExists) continue;
      await db.prepare(`INSERT INTO staff (id, staff_id, name, department_id, role, created_at)
        VALUES (?, ?, ?, ?, 'staff', ?) ON CONFLICT DO NOTHING`)
        .run(staffMember.id, staffMember.staffId, staffMember.name, staffMember.departmentId, new Date().toISOString());
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function readyClient(): Promise<Client> {
  const client = getClient();
  if (!globalForLibsql.campusLibsqlInitialization) {
    globalForLibsql.campusLibsqlInitialization = initialize(client).catch(error => {
      globalForLibsql.campusLibsqlInitialization = undefined;
      throw error;
    });
  }
  await globalForLibsql.campusLibsqlInitialization;
  return client;
}

const defaultExecutor = executorFor(async (sql, args) => {
  const client = await readyClient();
  return client.execute({ sql, args });
});

export const database = {
  ...defaultExecutor,
  async transaction<T>(callback: (transactionDatabase: Executor) => Promise<T>): Promise<T> {
    const client = await readyClient();
    const transaction: Transaction = await client.transaction('write');
    try {
      const execute: Execute = (sql, args) => transaction.execute({ sql, args });
      const result = await callback(executorFor(execute));
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

export async function departmentIdForCategory(category: IssueCategory): Promise<string> {
  const mapping = await database.prepare('SELECT department_id FROM category_mappings WHERE category = ?').get(category) as { department_id: string } | undefined;
  return mapping?.department_id || CATEGORY_DEPARTMENT_MAP[category];
}

export async function departmentName(departmentId: string): Promise<string> {
  const result = await database.prepare('SELECT name FROM departments WHERE id = ?').get(departmentId) as { name: string } | undefined;
  return result?.name || 'Administration';
}