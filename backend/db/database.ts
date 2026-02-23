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
  getApprovalsByApprover(approverEmail: string): Promise<Approval[]>;
  updateApproval(id: number, data: Partial<Approval>): Promise<Approval>;

  // Utility operations
  initialize(): Promise<void>;
  close(): Promise<void>;
}
