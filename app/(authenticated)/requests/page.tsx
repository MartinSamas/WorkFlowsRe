'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequestRow } from '@/components/request-row';
import type { RequestWithApprovals } from '@/app/api/types';

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestWithApprovals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me/requests')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load requests');
        const json = await res.json();
        setRequests(json.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-[3px] border-gray-200 border-t-blue-500 animate-spin" />
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
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black m-0">My Holiday Requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <p className="text-muted-foreground text-lg">You have no holiday requests yet.</p>
          <p className="text-sm text-muted-foreground">
            When you create a request it will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">
                    Days
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    hideRequestedBy
                    onClick={() => router.push(`/requests/${request.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
