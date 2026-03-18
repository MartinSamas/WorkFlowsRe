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

interface AddApproverDialogProps {
  onAdded: (approver: Approver) => void;
}

export function AddApproverDialog({ onAdded }: AddApproverDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'individual' | 'group'>('individual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setType('individual');
    setName('');
    setEmail('');
    setRole('');
    setError(null);
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    setOpen(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const body = { type, name, email, role: role.trim() || undefined };

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/approvers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error ?? 'Failed to add approver');
      }

      const json = await res.json();
      onAdded(json.data as Approver);
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Approver
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Approver</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type toggle */}
            <div className="flex rounded-md border overflow-hidden">
              {(['individual', 'group'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${type === t
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="approver-name">
                {type === 'group' ? 'Group Name' : 'Full Name'}
              </label>
              <input
                id="approver-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'group' ? 'Group name' : 'User name'}
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="approver-email">
                {type === 'group' ? 'Group Email' : 'Email'}
              </label>
              <input
                id="approver-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={type === 'group' ? 'group@ui42.com' : 'user@ui42.com'}
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="approver-role">
                Role <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="approver-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Project Manager"
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

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
                {submitting ? 'Adding…' : 'Add Approver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
