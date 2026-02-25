'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ApprovalActionDialogProps {
  requestId: number;
  requesterName: string;
  dateRange: string;
  requestType: string;
  action: 'approve' | 'deny';
  onConfirm: (notes: string) => Promise<void>;
  onCancel: () => void;
}

export function ApprovalActionDialog({
  requesterName,
  dateRange,
  requestType,
  action,
  onConfirm,
  onCancel,
}: ApprovalActionDialogProps) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprove = action === 'approve';
  const title = isApprove ? 'Approve Request?' : 'Deny Request?';

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 text-sm">
          <p className="font-medium">{requesterName}</p>
          <p className="text-muted-foreground capitalize">
            {requestType.replace(/_/g, ' ')} · {dateRange}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="decision-notes">
            Decision Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            id="decision-notes"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note about your decision…"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (isApprove ? 'Approving…' : 'Denying…') : isApprove ? 'Approve' : 'Deny'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
