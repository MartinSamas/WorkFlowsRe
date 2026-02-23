import { StatusBadge } from './status-badge';
import { formatDateRange, countDays, relativeTime } from '@/lib/date-utils';
import { Card, CardContent } from '@/components/ui/card';

interface RequestCardProps {
  request: {
    id: number;
    start_date: Date | string;
    end_date: Date | string;
    status: 'pending' | 'approved' | 'denied' | 'cancelled';
    request_type: string;
    notes?: string;
    created_at: Date | string;
  };
  onClick: () => void;
}

export function RequestCard({ request, onClick }: RequestCardProps) {
  const days = countDays(request.start_date, request.end_date);
  const dateRange = formatDateRange(request.start_date, request.end_date);
  const notesPreview = request.notes ? request.notes.slice(0, 100) : null;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md hover:-translate-y-0.5 transition-transform"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${request.request_type} request from ${dateRange}, status: ${request.status}`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={request.status} />
          <span className="text-xs text-muted-foreground">{relativeTime(request.created_at)}</span>
        </div>

        <div>
          <p className="font-medium text-sm capitalize">{request.request_type.replace(/_/g, ' ')}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{dateRange}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          {days} {days === 1 ? 'day' : 'days'}
        </p>

        {notesPreview && (
          <p className="text-xs text-muted-foreground line-clamp-2 border-t pt-2">{notesPreview}</p>
        )}
      </CardContent>
    </Card>
  );
}
