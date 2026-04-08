import { RequestRow } from '@/components/request-row';
import { db } from '@/backend/lib/db';
import { getCurrentUser } from '@/lib/actions';
import { redirect } from 'next/navigation';

export default async function RequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  const requests = await db.getAllRequests({ user_email: user.email });

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
                    href={`/requests/${request.id}`}
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
