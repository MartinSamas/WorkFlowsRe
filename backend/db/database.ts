export interface Request {
  id: number;
  user_email: string;
  user_name?: string;
  user_picture?: string;
  request_time: Date;
  start_date: Date;
  end_date: Date;
  request_type: string;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  notes?: string;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Approval {
  id: number;
  request_id: number;
  approver_email: string;
  approver_name?: string;
  approver_role?: string;
  status: 'pending' | 'approved' | 'denied';
  decision_notes?: string;
  responded_at?: Date;
  created_at: Date;
}

export interface RequestFilters {
  status?: 'pending' | 'approved' | 'denied' | 'cancelled';
  user_email?: string;
  request_type?: string;
  start_date_from?: Date;
  start_date_to?: Date;
  limit?: number;
  offset?: number;
}

export interface Admin {
  id: number;
  email: string;
  added_at: Date;
}

export interface Approver {
  id: number;
  type: 'individual' | 'group';
  name: string;
  email: string;
  role?: string;
  /** JSON array of member emails — only set for groups */
  group_emails?: string[];
  created_at: Date;
}

export interface DatabaseAdapter {
  // Request operations
  createRequest(data: Omit<Request, 'id' | 'created_at' | 'updated_at'>): Promise<Request>;
  getRequestById(id: number): Promise<Request | null>;
  getRequestsByUser(userEmail: string): Promise<Request[]>;
  getAllRequests(filters?: RequestFilters): Promise<Request[]>;
  updateRequest(id: number, data: Partial<Request>): Promise<Request>;
  deleteRequest(id: number): Promise<void>;

  // Approval operations
  createApproval(data: Omit<Approval, 'id' | 'created_at'>): Promise<Approval>;
  getApprovalsByRequest(requestId: number): Promise<Approval[]>;
  getApprovalsByRequests(requestIds: number[]): Promise<Approval[]>;
  getApprovalsByApprover(approverEmail: string): Promise<Approval[]>;
  updateApproval(id: number, data: Partial<Approval>): Promise<Approval>;

  // Admin operations
  getAdmins(): Promise<Admin[]>;
  addAdmin(email: string): Promise<Admin>;
  removeAdmin(email: string): Promise<void>;
  isAdmin(email: string): Promise<boolean>;

  // Approver (configurable pool) operations
  getApprovers(): Promise<Approver[]>;
  addApprover(data: Omit<Approver, 'id' | 'created_at'>): Promise<Approver>;
  removeApprover(id: number): Promise<void>;

  // Utility operations
  initialize(): Promise<void>;
  close(): Promise<void>;
}
