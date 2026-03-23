import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions';
import { db } from '@/backend/lib/db';
import { DashboardClient } from '@/components/admin/dashboard-client';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  const isAdmin = await db.isAdmin(user.email);
  if (!isAdmin) redirect('/requests');

  const approvers = await db.getApprovers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage the approvers that users can assign to their requests.
        </p>
      </div>

      <DashboardClient initialApprovers={approvers} />
    </div>
  );
}
