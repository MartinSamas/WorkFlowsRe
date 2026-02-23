import type { Request, Approval } from '@/backend/db/database';

export interface RequestWithApprovals extends Request {
  approvals: Approval[];
}

export interface CreateRequestDTO {
  start_date: string;
  end_date: string;
  request_type?: string;
  notes?: string;
  approvers: Array<{
    email: string;
    name: string;
    role: string;
  }>;
}

export interface ApprovalDecisionDTO {
  status: 'approved' | 'denied';
  decision_notes?: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
