import { StatusBadge } from './status-badge';
import { formatDate, relativeTime } from '@/lib/date-utils';

interface Approval {
  id: number;
  approver_name?: string;
  approver_role?: string;
  status: 'pending' | 'approved' | 'denied';
  decision_notes?: string;
  responded_at?: Date | string;
}

interface ApprovalListProps {
  approvals: Approval[];
}

export function ApprovalList({ approvals }: ApprovalListProps) {
  if (approvals.length === 0) {
    return <p className="text-sm text-muted-foreground">No approvers assigned.</p>;
  }

  return (
    <ul className="space-y-3" aria-label="Approvals">
      {approvals.map((approval) => (
        <li
          key={approval.id}
          className="flex items-start gap-3 rounded-lg border p-3 bg-card"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{approval.approver_name ?? 'Approver'}</span>
              {approval.approver_role && (
                <span className="text-xs text-muted-foreground">({approval.approver_role})</span>
              )}
              <StatusBadge status={approval.status} />
            </div>
            {approval.decision_notes && (
              <p className="mt-1 text-xs text-muted-foreground">{approval.decision_notes}</p>
            )}
            {approval.responded_at && (
              <p className="mt-1 text-xs text-muted-foreground">
                Responded {relativeTime(approval.responded_at)} &middot;{' '}
                {formatDate(approval.responded_at)}
              </p>
            )}
            {approval.status === 'pending' && !approval.responded_at && (
              <p className="mt-1 text-xs text-amber-600">Awaiting response</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
