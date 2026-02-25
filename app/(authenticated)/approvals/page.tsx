'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequestRow } from '@/components/request-row';
import { ApprovalStatusList } from '@/components/approval-status-list';
import { ApprovalActionDialog } from '@/components/approval-action-dialog';
import { formatDateRange } from '@/lib/date-utils';
import type { RequestWithApprovals } from '@/app/api/types';

interface ApprovalsResponse {
  data: RequestWithApprovals[];
  meta: { currentUserEmail: string };
}

interface DialogState {
  requestId: number;
  requesterName: string;
  dateRange: string;
  requestType: string;
  action: 'approve' | 'deny';
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestWithApprovals[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function loadApprovals() {
    try {
      const res = await fetch('/api/approvals');
      if (!res.ok) throw new Error('Failed to load approvals');
      const json: ApprovalsResponse = await res.json();
      setRequests(json.data ?? []);
      setCurrentUserEmail(json.meta?.currentUserEmail ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  function openDialog(request: RequestWithApprovals, action: 'approve' | 'deny') {
    setDialog({
      requestId: request.id,
      requesterName: request.user_name ?? request.user_email,
      dateRange: formatDateRange(request.start_date, request.end_date),
      requestType: request.request_type,
      action,
    });
  }

  async function handleDecision(notes: string) {
    if (!dialog) return;
    const res = await fetch(`/api/requests/${dialog.requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: dialog.action === 'approve' ? 'approved' : 'denied', decision_notes: notes || undefined }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? 'Failed to submit decision');
    }
    setDialog(null);
    setSuccessMessage(dialog.action === 'approve' ? 'Request approved!' : 'Request denied.');
    setTimeout(() => setSuccessMessage(null), 3000);
    setLoading(true);
    await loadApprovals();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading approvals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending Approvals</h1>

      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <p className="text-muted-foreground text-lg">No pending approvals.</p>
          <p className="text-sm text-muted-foreground">
            Requests assigned to you for approval will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Requester
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                        Days
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <RequestRow
                      request={request}
                      onClick={() =>
                        setExpandedId(expandedId === request.id ? null : request.id)
                      }
                      showActions
                      onApprove={() => openDialog(request, 'approve')}
                      onDeny={() => openDialog(request, 'deny')}
                    />
                  </tbody>
                </table>
              </div>

              {/* Requester info row */}
              {request.user_name && (
                <div className="px-4 py-2 bg-muted/30 border-t text-xs text-muted-foreground">
                  Requested by <span className="font-medium text-foreground">{request.user_name}</span>
                </div>
              )}

              {/* Expandable approvers section */}
              <div className="border-t">
                <button
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                >
                  <span>
                    Approvers ({request.approvals.length}) ·{' '}
                    {request.approvals.filter((a) => a.status === 'approved').length} approved,{' '}
                    {request.approvals.filter((a) => a.status === 'pending').length} pending
                  </span>
                  <span>{expandedId === request.id ? '▲' : '▼'}</span>
                </button>
                {expandedId === request.id && (
                  <div className="px-4 py-3 border-t bg-muted/10">
                    <ApprovalStatusList
                      approvals={request.approvals}
                      currentUserEmail={currentUserEmail}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {dialog && (
        <ApprovalActionDialog
          requestId={dialog.requestId}
          requesterName={dialog.requesterName}
          dateRange={dialog.dateRange}
          requestType={dialog.requestType}
          action={dialog.action}
          onConfirm={handleDecision}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
