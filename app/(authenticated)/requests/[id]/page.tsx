'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StatusBadge } from '@/components/status-badge';
import { ApprovalList } from '@/components/approval-list';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateRange, countDays, relativeTime } from '@/lib/date-utils';
import type { RequestWithApprovals } from '@/app/api/types';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [request, setRequest] = useState<RequestWithApprovals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/requests/${params.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? 'Failed to load request');
        }
        const json = await res.json();
        setRequest(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleCancel() {
    if (!request) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? 'Failed to cancel request');
      }
      const json = await res.json();
      setRequest(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-destructive">{error ?? 'Request not found'}</p>
        <Button variant="outline" onClick={() => router.push('/requests')}>
          Back to Requests
        </Button>
      </div>
    );
  }

  const days = countDays(request.start_date, request.end_date);
  const dateRange = formatDateRange(request.start_date, request.end_date);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.push('/requests')}>
        ← Back to Requests
      </Button>

      {/* Header card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold capitalize">{request.request_type.replace(/_/g, ' ')}</h1>
            <p className="text-muted-foreground text-sm mt-1">{dateRange}</p>
          </div>
          <StatusBadge status={request.status} size="md" />
        </div>

        {/* User info */}
        {(request.user_name || request.user_picture) && (
          <div className="flex items-center gap-3">
            {request.user_picture ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                <Image
                  src={request.user_picture}
                  alt={request.user_name ?? 'User'}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ) : null}
            <span className="text-sm font-medium">{request.user_name}</span>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Start date</p>
            <p className="font-medium">{formatDate(request.start_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End date</p>
            <p className="font-medium">{formatDate(request.end_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium">{days} {days === 1 ? 'day' : 'days'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">{relativeTime(request.created_at)}</p>
          </div>
        </div>

        {/* Notes */}
        {request.notes && (
          <div>
            <p className="text-muted-foreground text-sm mb-1">Notes</p>
            <p className="text-sm whitespace-pre-line">{request.notes}</p>
          </div>
        )}

        {/* Admin notes */}
        {request.admin_notes && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-muted-foreground text-xs font-semibold uppercase mb-1">Admin Notes</p>
            <p className="text-sm whitespace-pre-line">{request.admin_notes}</p>
          </div>
        )}
      </div>

      {/* Approvals */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Approvals</h2>
        <ApprovalList approvals={request.approvals} />
      </div>

      {/* Actions */}
      {request.status === 'pending' && (
        <div>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling…' : 'Cancel Request'}
          </Button>
        </div>
      )}
    </div>
  );
}
