import { StatusBadge } from './status-badge';
import { formatDateRange, countDays, relativeTime } from '@/lib/date-utils';

interface RequestRowProps {
  request: {
    id: number;
    start_date: Date | string;
    end_date: Date | string;
    status: 'pending' | 'approved' | 'denied' | 'cancelled';
    request_type: string;
    notes?: string;
    created_at: Date | string;
    user_name?: string;
  };
  onClick: () => void;
  showActions?: boolean;
  onApprove?: () => void;
  onDeny?: () => void;
}

export function RequestRow({ request, onClick, showActions, onApprove, onDeny }: RequestRowProps) {
  const days = countDays(request.start_date, request.end_date);
  const dateRange = formatDateRange(request.start_date, request.end_date);
  const notesPreview = request.notes ? request.notes.slice(0, 60) : null;

  return (
    <tr
      className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <td className="px-4 py-3">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">{dateRange}</td>
      <td className="px-4 py-3 text-sm capitalize">{request.request_type.replace(/_/g, ' ')}</td>
      <td className="px-4 py-3 text-sm text-center">{days}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px]">
        {notesPreview ? (
          <span className="line-clamp-1">{notesPreview}</span>
        ) : (
          <span className="italic">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {relativeTime(request.created_at)}
      </td>
      {showActions && (
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={onDeny}
              className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Deny
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
