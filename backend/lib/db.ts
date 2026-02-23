import path from 'path';
import { SQLiteAdapter } from '../db/sqlite';
import type { DatabaseAdapter } from '../db/database';

const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';
const DATABASE_URL = process.env.DATABASE_URL || path.join(process.cwd(), 'backend', 'data', 'workflows.db');

function createDatabaseAdapter(): DatabaseAdapter {
  if (DATABASE_TYPE === 'sqlite') {
    return new SQLiteAdapter(DATABASE_URL);
  }
  throw new Error(`Unsupported database type: ${DATABASE_TYPE}. Implement a new adapter and add it here.`);
}

export const db: DatabaseAdapter = createDatabaseAdapter();
