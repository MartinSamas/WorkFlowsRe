-- Holiday Request Management System Schema

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_picture TEXT,
  request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  request_type TEXT DEFAULT 'vacation',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  approver_email TEXT NOT NULL,
  approver_name TEXT,
  approver_role TEXT,
  status TEXT DEFAULT 'pending',
  decision_notes TEXT,
  responded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_requests_user_email_status ON requests(user_email, status);
CREATE INDEX IF NOT EXISTS idx_requests_status_created_at ON requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_approvals_request_id ON approvals(request_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver_email_status ON approvals(approver_email, status);
