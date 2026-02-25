import { formatDate, relativeTime } from '@/lib/date-utils';

interface Approval {
  id: number;
  approver_name?: string;
  approver_email: string;
  approver_role?: string;
  status: 'pending' | 'approved' | 'denied';
  decision_notes?: string;
  responded_at?: Date | string;
}

interface ApprovalStatusListProps {
  approvals: Approval[];
  currentUserEmail?: string;
}

const statusIcon: Record<Approval['status'], string> = {
  approved: '✅',
  denied: '❌',
  pending: '⏳',
};

const statusColor: Record<Approval['status'], string> = {
  approved: 'text-green-700',
  denied: 'text-red-700',
  pending: 'text-amber-600',
};

export function ApprovalStatusList({ approvals, currentUserEmail }: ApprovalStatusListProps) {
  if (approvals.length === 0) {
    return <p className="text-sm text-muted-foreground">No approvers assigned.</p>;
  }

  return (
    <ul className="space-y-2" aria-label="Approvers">
      {approvals.map((approval) => {
        const isCurrentUser = approval.approver_email === currentUserEmail;
        return (
          <li
            key={approval.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              isCurrentUser ? 'bg-primary/5 border-primary/20' : 'bg-card'
            }`}
          >
            <span className="text-base leading-none mt-0.5" aria-hidden="true">
              {statusIcon[approval.status]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium text-sm ${isCurrentUser ? 'font-bold' : ''}`}>
                  {isCurrentUser ? 'You' : (approval.approver_name ?? approval.approver_email)}
                  {isCurrentUser && approval.approver_name ? ` (${approval.approver_name})` : ''}
                </span>
                {approval.approver_role && (
                  <span className="text-xs text-muted-foreground">· {approval.approver_role}</span>
                )}
                <span className={`text-xs font-semibold capitalize ${statusColor[approval.status]}`}>
                  {approval.status}
                </span>
              </div>
              {approval.decision_notes && (
                <p className="mt-1 text-xs text-muted-foreground">{approval.decision_notes}</p>
              )}
              {approval.responded_at ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Responded {relativeTime(approval.responded_at)} · {formatDate(approval.responded_at)}
                </p>
              ) : approval.status === 'pending' ? (
                <p className="mt-1 text-xs text-amber-600">Awaiting response</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
