'use client';

import { useState } from 'react';
import { ApproverList } from '@/components/admin/approver-list';
import { AddApproverDialog } from '@/components/admin/add-approver-dialog';
import type { Approver } from '@/backend/db/database';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface DashboardClientProps {
  initialApprovers: Approver[];
  initialSettings: {
    autoApproveDays: string | null;
  };
}

export function DashboardClient({ initialApprovers, initialSettings }: DashboardClientProps) {
  const [approvers, setApprovers] = useState<Approver[]>(initialApprovers);
  const [error, setError] = useState<string | null>(null);

  const [autoApproveDays, setAutoApproveDays] = useState<string>(initialSettings.autoApproveDays || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

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

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_approve_days: autoApproveDays }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="approvers">
        <TabsList>
          <TabsTrigger value="approvers">Approvers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="approvers" className="space-y-4 mt-6">
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
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="auto-approve-days">Auto-Approve Pending Requests (Working Days)</Label>
              <Input
                id="auto-approve-days"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 5"
                value={autoApproveDays}
                onChange={(e) => setAutoApproveDays(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Current requests pending for this many working days (skipping weekends and Slovak holidays) will be automatically approved when the system cron runs. E.g. leave empty to disable.
              </p>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>

            {saveMessage && (
              <div className={`mt-2 rounded-md px-4 py-3 text-sm ${saveMessage.type === 'success' ? 'border border-green-500/30 bg-green-500/10 text-green-700' : 'border border-destructive/30 bg-destructive/10 text-destructive'}`}>
                {saveMessage.text}
              </div>
            )}
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
