import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(process.argv[2] || path.join(scriptDirectory, '../data/smart-campus.sqlite'));
const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before importing.');
}

const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
const target = createClient({ url, authToken });
const tables = [
  ['departments', 'id'],
  ['students', 'id'],
  ['staff', 'id'],
  ['admins', 'id'],
  ['category_mappings', 'category'],
  ['ticket_sequence', 'id'],
  ['issues', 'id'],
  ['issue_history', 'id'],
  ['notifications', 'id'],
];

try {
  await target.execute('PRAGMA foreign_keys = ON');

  for (const [tableName, primaryKey] of tables) {
    const rows = source.prepare(`SELECT * FROM "${tableName}"`).all();
    if (rows.length === 0) {
      console.log(`${tableName}: 0 rows`);
      continue;
    }

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const updates = columns.filter(column => column !== primaryKey)
      .map(column => `"${column}" = excluded."${column}"`).join(', ');
    const conflict = updates ? `DO UPDATE SET ${updates}` : 'DO NOTHING';
    const sql = `INSERT INTO "${tableName}" (${columns.map(column => `"${column}"`).join(', ')}) VALUES (${placeholders}) ON CONFLICT("${primaryKey}") ${conflict}`;

    for (let offset = 0; offset < rows.length; offset += 100) {
      const transaction = await target.transaction('write');
      try {
        for (const row of rows.slice(offset, offset + 100)) {
          await transaction.execute({ sql, args: columns.map(column => row[column] ?? null) });
        }
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    console.log(`${tableName}: imported ${rows.length} rows`);
  }

  const foreignKeyCheck = await target.execute('PRAGMA foreign_key_check');
  if (foreignKeyCheck.rows.length) {
    throw new Error(`Foreign-key check failed: ${JSON.stringify(foreignKeyCheck.rows)}`);
  }
} finally {
  source.close();
  await target.close();
}