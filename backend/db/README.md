# Database Layer

This directory contains the database abstraction layer for the holiday request management system.

## Schema Overview

### `requests` table
Stores all holiday/leave requests submitted by users.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER | Primary key, auto-incremented |
| `user_email` | TEXT | User's email from Google OAuth |
| `user_name` | TEXT | User's full name |
| `user_picture` | TEXT | Profile picture URL |
| `request_time` | DATETIME | When the request was submitted |
| `start_date` | DATE | Start of the leave period |
| `end_date` | DATE | End of the leave period |
| `request_type` | TEXT | Type: `vacation`, `sick_leave`, `personal`, etc. |
| `status` | TEXT | Status: `pending`, `approved`, `denied`, `cancelled` |
| `notes` | TEXT | Optional notes from the requester |
| `admin_notes` | TEXT | Optional notes from approvers |
| `created_at` | DATETIME | Record creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |

### `approvals` table
Stores approval decisions for each request, supporting multi-level approval workflows.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER | Primary key, auto-incremented |
| `request_id` | INTEGER | Foreign key to `requests.id` |
| `approver_email` | TEXT | Approver's email address |
| `approver_name` | TEXT | Approver's full name |
| `approver_role` | TEXT | Role: `project_manager`, `department_head`, `hr` |
| `status` | TEXT | Status: `pending`, `approved`, `denied` |
| `decision_notes` | TEXT | Notes explaining the decision |
| `responded_at` | DATETIME | When the decision was made |
| `created_at` | DATETIME | Record creation timestamp |

## File Structure

```
backend/
  db/
    schema.sql     # SQL schema (tables + indexes)
    database.ts    # TypeScript interfaces and types
    sqlite.ts      # SQLite implementation of DatabaseAdapter
    index.ts       # Re-exports for convenient imports
    README.md      # This file
  lib/
    db.ts          # Initializes and exports the database instance
  data/
    workflows.db   # SQLite database file (git-ignored)
    .gitkeep       # Preserves the data/ directory in git
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_TYPE` | `sqlite` | Database backend to use |
| `DATABASE_URL` | `backend/data/workflows.db` | Path or connection string |

## How to Add a New Table / Migration

1. Add the new `CREATE TABLE` statement to `schema.sql`.
2. Add the corresponding TypeScript interface to `database.ts`.
3. Add the new CRUD methods to the `DatabaseAdapter` interface in `database.ts`.
4. Implement the new methods in `sqlite.ts` (and any other adapters).

> **Note:** `initialize()` is idempotent — it uses `CREATE TABLE IF NOT EXISTS`, so running it multiple times is safe for adding new tables. For destructive migrations (renaming columns, changing types), write explicit migration SQL and run it once.

## How to Switch to PostgreSQL

1. Install the PostgreSQL client:
   ```bash
   npm install pg
   npm install --save-dev @types/pg
   ```

2. Create `backend/db/postgresql.ts` implementing `DatabaseAdapter`:
   ```typescript
   import { Pool } from 'pg';
   import type { DatabaseAdapter, Request, Approval, RequestFilters } from './database';

   export class PostgreSQLAdapter implements DatabaseAdapter {
     private pool: Pool;

     constructor(connectionString: string) {
       this.pool = new Pool({ connectionString });
     }

     async initialize(): Promise<void> {
       // Run schema.sql against PostgreSQL (adjust syntax as needed)
     }

     // Implement all other DatabaseAdapter methods...
   }
   ```

3. Update `backend/lib/db.ts` to use the new adapter:
   ```typescript
   import { PostgreSQLAdapter } from '../db/postgresql';

   function createDatabaseAdapter(): DatabaseAdapter {
     if (DATABASE_TYPE === 'postgresql') {
       return new PostgreSQLAdapter(DATABASE_URL);
     }
     // ...
   }
   ```

4. Set environment variables:
   ```bash
   DATABASE_TYPE=postgresql
   DATABASE_URL=postgresql://user:password@localhost:5432/workflows
   ```

That's it — the rest of the application uses `DatabaseAdapter` and doesn't need to change.
