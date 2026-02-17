import sqlite4 from 'sqlite';
import path from 'path';

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../db/database.sqlite');

// Enable verbose mode for debugging
const sqlite = sqlite4.verbose();

export const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create tables if they don't exist
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                google_id TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'employee',
                avatar_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Holiday requests table
        db.run(`
            CREATE TABLE IF NOT EXISTS holiday_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                total_days REAL NOT NULL,
                type TEXT NOT NULL,
                reason TEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Approvals table
        db.run(`
            CREATE TABLE IF NOT EXISTS approvals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id INTEGER NOT NULL,
                approver_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                comment TEXT,
                approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES holiday_requests(id),
                FOREIGN KEY (approver_id) REFERENCES users(id)
            )
        `);

        // User allowances table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_allowances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                year INTEGER NOT NULL,
                total_days REAL DEFAULT 25,
                used_days REAL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(user_id, year)
            )
        `);

        // Calendar events table
        db.run(`
            CREATE TABLE IF NOT EXISTS calendar_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id INTEGER NOT NULL,
                google_calendar_event_id TEXT,
                FOREIGN KEY (request_id) REFERENCES holiday_requests(id)
            )
        `);

        // Create indexes
        db.run('CREATE INDEX IF NOT EXISTS idx_requests_user ON holiday_requests(user_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_requests_status ON holiday_requests(status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_requests_dates ON holiday_requests(start_date, end_date)');

        console.log('✅ Database tables initialized');
    });
}

// Helper function to run queries with promises
export const dbRun = (sql: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

export const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
