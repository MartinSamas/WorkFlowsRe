'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Approver } from '@/backend/db/database';

const REQUEST_TYPES = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick_leave', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal' },
];

export function NewRequestDialog() {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requestType, setRequestType] = useState('vacation');
  const [notes, setNotes] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);

  async function loadApprovers() {
    setLoadingApprovers(true);
    try {
      const res = await fetch('/api/admin/approvers');
      if (res.ok) {
        const json = await res.json();
        setApprovers(json.data ?? []);
      }
    } catch {
      // silently fail; user will see empty list
    } finally {
      setLoadingApprovers(false);
    }
  }

  function resetForm() {
    setStartDate('');
    setEndDate('');
    setRequestType('vacation');
    setNotes('');
    setSelectedIds([]);
    setError(null);
  }

  function handleOpenChange(value: boolean) {
    if (value) loadApprovers();
    else resetForm();
    setOpen(value);
  }

  function toggleApprover(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  /** Remove individuals who are already a member of a selected group */
  function deduplicateApprovers(selected: Approver[]): Approver[] {
    const selectedGroups = selected.filter((a) => a.type === 'group');
    const groupMemberEmails = new Set(
      selectedGroups.flatMap((g) => (g.group_emails ?? []).map((e) => e.toLowerCase())),
    );
    return selected.filter(
      (a) => a.type === 'group' || !groupMemberEmails.has(a.email.toLowerCase()),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError('Please select start and end dates.');
      return;
    }
    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Please select at least one approver.');
      return;
    }

    const rawSelected = approvers.filter((a) => selectedIds.includes(a.id));
    const deduped = deduplicateApprovers(rawSelected);

    const approversPayload = deduped.map((a) => ({
      email: a.email,
      name: a.name,
      role: a.type === 'group' ? 'group' : (a.role ?? ''),
    }));

    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: `${startDate}T00:00:00.000Z`,
          end_date: `${endDate}T00:00:00.000Z`,
          request_type: requestType,
          notes: notes.trim() || undefined,
          approvers: approversPayload,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        if (json.details && Array.isArray(json.details)) {
          const messages = json.details.map((d: any) => d.message).join('\n');
          throw new Error(messages);
        }
        throw new Error(json?.error ?? 'Failed to submit request');
      }

      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const individuals = approvers.filter((a) => a.type === 'individual');
  const groups = approvers.filter((a) => a.type === 'group');

  return (
    <>
      <Button size="sm" onClick={() => handleOpenChange(true)}>
        <Plus className="h-4 w-4 mr-1" />
        New Request
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Holiday Request</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="start-date">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="end-date">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="request-type">
                Type
              </label>
              <select
                id="request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="notes">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details…"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Approvers</p>

              {loadingApprovers ? (
                <p className="text-sm text-muted-foreground py-2">Loading approvers…</p>
              ) : approvers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No approvers configured. Ask an admin to add some.
                </p>
              ) : (
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {groups.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Groups
                      </p>
                      {groups.map((a) => (
                        <label
                          key={a.id}
                          className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(a.id)}
                            onChange={() => toggleApprover(a.id)}
                            className="h-4 w-4 accent-primary"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {a.email} · 1 response needed from{' '}
                              {a.group_emails?.length ?? 0} member
                              {(a.group_emails?.length ?? 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {individuals.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Individuals
                      </p>
                      {individuals.map((a) => (
                        <label
                          key={a.id}
                          className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(a.id)}
                            onChange={() => toggleApprover(a.id)}
                            className="h-4 w-4 accent-primary"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.role ?? a.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
