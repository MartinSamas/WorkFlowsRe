import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { DatabaseAdapter, Request, Approval, RequestFilters } from './database';

function toDate(value: string | null | undefined): Date {
  if (!value) return new Date();
  return new Date(value);
}

function toDateOrUndefined(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  return new Date(value);
}

function toISOString(date: Date | string | undefined | null): string | null {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
}

interface RequestRow {
  id: number;
  user_email: string;
  user_name: string | null;
  user_picture: string | null;
  request_time: string;
  start_date: string;
  end_date: string;
  request_type: string;
  status: string;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ApprovalRow {
  id: number;
  request_id: number;
  approver_email: string;
  approver_name: string | null;
  approver_role: string | null;
  status: string;
  decision_notes: string | null;
  responded_at: string | null;
  created_at: string;
}

function rowToRequest(row: RequestRow): Request {
  return {
    id: row.id,
    user_email: row.user_email,
    user_name: row.user_name ?? undefined,
    user_picture: row.user_picture ?? undefined,
    request_time: toDate(row.request_time),
    start_date: toDate(row.start_date),
    end_date: toDate(row.end_date),
    request_type: row.request_type,
    status: row.status as Request['status'],
    notes: row.notes ?? undefined,
    admin_notes: row.admin_notes ?? undefined,
    created_at: toDate(row.created_at),
    updated_at: toDate(row.updated_at),
  };
}

function rowToApproval(row: ApprovalRow): Approval {
  return {
    id: row.id,
    request_id: row.request_id,
    approver_email: row.approver_email,
    approver_name: row.approver_name ?? undefined,
    approver_role: row.approver_role ?? undefined,
    status: row.status as Approval['status'],
    decision_notes: row.decision_notes ?? undefined,
    responded_at: toDateOrUndefined(row.responded_at),
    created_at: toDate(row.created_at),
  };
}

export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  async initialize(): Promise<void> {
    const schemaPath = join(process.cwd(), 'backend', 'db', 'schema.sql');
    try {
      const schema = readFileSync(schemaPath, 'utf-8');
      this.db.exec(schema);
    } catch (error) {
      console.error('Failed to read schema file:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }

  async createRequest(data: Omit<Request, 'id' | 'created_at' | 'updated_at'>): Promise<Request> {
    const stmt = this.db.prepare(`
      INSERT INTO requests (user_email, user_name, user_picture, request_time, start_date, end_date, request_type, status, notes, admin_notes)
      VALUES (@user_email, @user_name, @user_picture, @request_time, @start_date, @end_date, @request_type, @status, @notes, @admin_notes)
    `);
    const result = stmt.run({
      user_email: data.user_email,
      user_name: data.user_name ?? null,
      user_picture: data.user_picture ?? null,
      request_time: toISOString(data.request_time),
      start_date: toISOString(data.start_date),
      end_date: toISOString(data.end_date),
      request_type: data.request_type,
      status: data.status,
      notes: data.notes ?? null,
      admin_notes: data.admin_notes ?? null,
    });
    const row = this.db.prepare('SELECT * FROM requests WHERE id = ?').get(result.lastInsertRowid) as RequestRow;
    return rowToRequest(row);
  }

  async getRequestById(id: number): Promise<Request | null> {
    const row = this.db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as RequestRow | undefined;
    return row ? rowToRequest(row) : null;
  }

  async getRequestsByUser(userEmail: string): Promise<Request[]> {
    const rows = this.db.prepare('SELECT * FROM requests WHERE user_email = ? ORDER BY created_at DESC').all(userEmail) as RequestRow[];
    return rows.map(rowToRequest);
  }

  async getAllRequests(filters?: RequestFilters): Promise<Request[]> {
    let query = 'SELECT * FROM requests WHERE 1=1';
    const params: (string | null)[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.user_email) {
      query += ' AND user_email = ?';
      params.push(filters.user_email);
    }
    if (filters?.request_type) {
      query += ' AND request_type = ?';
      params.push(filters.request_type);
    }
    if (filters?.start_date_from) {
      query += ' AND start_date >= ?';
      params.push(toISOString(filters.start_date_from));
    }
    if (filters?.start_date_to) {
      query += ' AND start_date <= ?';
      params.push(toISOString(filters.start_date_to));
    }

    query += ' ORDER BY created_at DESC';
    const rows = this.db.prepare(query).all(...params) as RequestRow[];
    return rows.map(rowToRequest);
  }

  async updateRequest(id: number, data: Partial<Request>): Promise<Request> {
    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.user_email !== undefined) { fields.push('user_email = ?'); params.push(data.user_email); }
    if (data.user_name !== undefined) { fields.push('user_name = ?'); params.push(data.user_name ?? null); }
    if (data.user_picture !== undefined) { fields.push('user_picture = ?'); params.push(data.user_picture ?? null); }
    if (data.start_date !== undefined) { fields.push('start_date = ?'); params.push(toISOString(data.start_date)); }
    if (data.end_date !== undefined) { fields.push('end_date = ?'); params.push(toISOString(data.end_date)); }
    if (data.request_type !== undefined) { fields.push('request_type = ?'); params.push(data.request_type); }
    if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
    if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes ?? null); }
    if (data.admin_notes !== undefined) { fields.push('admin_notes = ?'); params.push(data.admin_notes ?? null); }

    if (fields.length === 0) {
      const existing = await this.getRequestById(id);
      if (!existing) throw new Error(`Request with id ${id} not found`);
      return existing;
    }

    fields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    this.db.prepare(`UPDATE requests SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    const updated = await this.getRequestById(id);
    if (!updated) throw new Error(`Request with id ${id} not found`);
    return updated;
  }

  async deleteRequest(id: number): Promise<void> {
    this.db.prepare('DELETE FROM requests WHERE id = ?').run(id);
  }

  async createApproval(data: Omit<Approval, 'id' | 'created_at'>): Promise<Approval> {
    const stmt = this.db.prepare(`
      INSERT INTO approvals (request_id, approver_email, approver_name, approver_role, status, decision_notes, responded_at)
      VALUES (@request_id, @approver_email, @approver_name, @approver_role, @status, @decision_notes, @responded_at)
    `);
    const result = stmt.run({
      request_id: data.request_id,
      approver_email: data.approver_email,
      approver_name: data.approver_name ?? null,
      approver_role: data.approver_role ?? null,
      status: data.status,
      decision_notes: data.decision_notes ?? null,
      responded_at: toISOString(data.responded_at),
    });
    const row = this.db.prepare('SELECT * FROM approvals WHERE id = ?').get(result.lastInsertRowid) as ApprovalRow;
    return rowToApproval(row);
  }

  async getApprovalsByRequest(requestId: number): Promise<Approval[]> {
    const rows = this.db.prepare('SELECT * FROM approvals WHERE request_id = ? ORDER BY created_at ASC').all(requestId) as ApprovalRow[];
    return rows.map(rowToApproval);
  }

  async getApprovalsByApprover(approverEmail: string): Promise<Approval[]> {
    const rows = this.db.prepare('SELECT * FROM approvals WHERE approver_email = ? ORDER BY created_at DESC').all(approverEmail) as ApprovalRow[];
    return rows.map(rowToApproval);
  }

  async updateApproval(id: number, data: Partial<Approval>): Promise<Approval> {
    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.approver_email !== undefined) { fields.push('approver_email = ?'); params.push(data.approver_email); }
    if (data.approver_name !== undefined) { fields.push('approver_name = ?'); params.push(data.approver_name ?? null); }
    if (data.approver_role !== undefined) { fields.push('approver_role = ?'); params.push(data.approver_role ?? null); }
    if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
    if (data.decision_notes !== undefined) { fields.push('decision_notes = ?'); params.push(data.decision_notes ?? null); }
    if (data.responded_at !== undefined) { fields.push('responded_at = ?'); params.push(toISOString(data.responded_at)); }

    params.push(id);

    if (fields.length === 0) {
      const row = this.db.prepare('SELECT * FROM approvals WHERE id = ?').get(id) as ApprovalRow | undefined;
      if (!row) throw new Error(`Approval with id ${id} not found`);
      return rowToApproval(row);
    }

    this.db.prepare(`UPDATE approvals SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    const row = this.db.prepare('SELECT * FROM approvals WHERE id = ?').get(id) as ApprovalRow | undefined;
    if (!row) throw new Error(`Approval with id ${id} not found`);
    return rowToApproval(row);
  }
}
