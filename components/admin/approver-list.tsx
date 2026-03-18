'use client';

import { useState } from 'react';
import { Trash2, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Approver } from '@/backend/db/database';

interface ApproverListProps {
  approvers: Approver[];
  onRemove: (id: number) => Promise<void>;
}

export function ApproverList({ approvers, onRemove }: ApproverListProps) {
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function handleRemove(id: number) {
    setRemovingId(id);
    try {
      await onRemove(id);
    } finally {
      setRemovingId(null);
    }
  }

  if (approvers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
        <Users className="mx-auto h-8 w-8 mb-3 opacity-40" />
        <p className="text-sm font-medium">No approvers configured yet.</p>
        <p className="text-xs mt-1">Add individuals or groups using the button above.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Role / Members
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {approvers.map((approver) => (
            <tr key={approver.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3">
                {approver.type === 'group' ? (
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    Group
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    Individual
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 font-medium">{approver.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{approver.email}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {approver.type === 'group' ? (
                  <span className="text-xs">
                    {approver.group_emails?.length ?? 0} member
                    {(approver.group_emails?.length ?? 0) !== 1 ? 's' : ''}
                    {approver.group_emails && approver.group_emails.length > 0 && (
                      <span className="block text-muted-foreground/70 mt-0.5 truncate max-w-[240px]">
                        {approver.group_emails.join(', ')}
                      </span>
                    )}
                  </span>
                ) : (
                  approver.role ?? <span className="italic opacity-50">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(approver.id)}
                  disabled={removingId === approver.id}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
