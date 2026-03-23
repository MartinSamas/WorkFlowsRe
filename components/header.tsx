import Image from 'next/image';
import { getCurrentUser } from '@/lib/actions';
import { LogoutButton } from '@/components/logout-button';
import { NavLinks } from '@/components/nav-links';
import { NewRequestDialog } from '@/components/new-request-dialog';
import { db } from '@/backend/lib/db';

export async function Header() {
  const user = await getCurrentUser();

  if (!user) return null;

  let pendingApprovalsCount = 0;
  let isAdmin = false;
  try {
    const allApprovers = await db.getApprovers();
    const groupsUserBelongsTo = allApprovers
      .filter(
        (a) =>
          a.type === 'group' &&
          a.group_emails?.some((e) => e.toLowerCase() === user.email.toLowerCase()),
      )
      .map((g) => g.email);

    // Collect approval rows assigned directly to the user or to one of their groups
    const directApprovals = await db.getApprovalsByApprover(user.email);
    const groupApprovals = (
      await Promise.all(groupsUserBelongsTo.map((ge) => db.getApprovalsByApprover(ge)))
    ).flat();

    // Map and de-duplicate by approval id
    const approvalMap = new Map();
    [...directApprovals, ...groupApprovals].forEach((a) => {
      if (a.status === 'pending') {
        approvalMap.set(a.id, a);
      }
    });

    const pendingApprovals = Array.from(approvalMap.values());
    const requestsStatus = await Promise.all(
      pendingApprovals.map(async (approval) => {
        const req = await db.getRequestById(approval.request_id);
        return req?.status === 'pending' ? 1 : 0;
      }),
    );

    pendingApprovalsCount = requestsStatus.reduce((acc, curr) => acc + curr, 0);
    isAdmin = await db.isAdmin(user.email);
  } catch (err) {
    console.error('Error fetching pending notifications count:', err);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">WorkFlows</span>
          <NavLinks pendingApprovalsCount={pendingApprovalsCount} isAdmin={isAdmin} />
        </div>

        <div className="flex items-center gap-3">
          {/* New request */}
          <NewRequestDialog />

          {/* Profile picture */}
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
            {user.picture ? (
              <Image
                src={user.picture}
                alt={user.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">{
                user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}</span>
            )}
          </div>

          {/* Name */}
          <span className="hidden sm:block text-sm font-medium">{user.name}</span>

          {/* Logout */}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
