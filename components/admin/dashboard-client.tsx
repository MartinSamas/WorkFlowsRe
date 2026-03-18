'use client';

import { useState } from 'react';
import { ApproverList } from '@/components/admin/approver-list';
import { AddApproverDialog } from '@/components/admin/add-approver-dialog';
import type { Approver } from '@/backend/db/database';

interface DashboardClientProps {
  initialApprovers: Approver[];
}

export function DashboardClient({ initialApprovers }: DashboardClientProps) {
  const [approvers, setApprovers] = useState<Approver[]>(initialApprovers);
  const [error, setError] = useState<string | null>(null);

  function handleAdded(approver: Approver) {
    setApprovers((prev) => [...prev, approver]);
  }

  async function handleRemove(id: number) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/approvers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error ?? 'Failed to remove approver');
      }
      setApprovers((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {approvers.length} approver{approvers.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <AddApproverDialog onAdded={handleAdded} />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <ApproverList approvers={approvers} onRemove={handleRemove} />
    </div>
  );
}
