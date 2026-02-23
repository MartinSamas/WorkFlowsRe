'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequestCard } from '@/components/request-card';
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
        <p className="text-muted-foreground">Loading requests…</p>
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
      <h1 className="text-2xl font-bold">My Holiday Requests</h1>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <p className="text-muted-foreground text-lg">You have no holiday requests yet.</p>
          <p className="text-sm text-muted-foreground">
            When you create a request it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onClick={() => router.push(`/requests/${request.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
