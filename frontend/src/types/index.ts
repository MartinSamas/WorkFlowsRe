export interface User {
    id: number;
    google_id: string;
    email: string;
    name: string;
    role: 'employee' | 'manager' | 'admin';
    avatar_url?: string;
    created_at: string;
}

export interface HolidayRequest {
    id: number;
    user_id: number;
    start_date: string;
    end_date: string;
    total_days: number;
    type: 'annual' | 'sick' | 'unpaid' | 'other';
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface Approval {
    id: number;
    request_id: number;
    approver_id: number;
    status: 'approved' | 'rejected';
    comment?: string;
    approved_at: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}
