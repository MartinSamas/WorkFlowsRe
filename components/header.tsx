import Image from 'next/image';
import { getCurrentUser } from '@/lib/actions';
import { LogoutButton } from '@/components/logout-button';
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

    const directApprovals = await db.getApprovalsByApprover(user.email);
    const groupApprovals = (
      await Promise.all(groupsUserBelongsTo.map((ge) => db.getApprovalsByApprover(ge)))
    ).flat();

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

    pendingApprovalsCount = requestsStatus.reduce((acc: number, curr) => acc + curr, 0);
    isAdmin = await db.isAdmin(user.email);
  } catch (err) {
    console.error('Error fetching pending notifications count:', err);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black">
      <div className="flex items-center justify-between px-8 h-[72px]">
        <div className="flex items-center gap-2">
          <a href="/requests" className="site-logo flex items-center gap-2 text-white no-underline">
            <Image
              src="https://taskman.ui42.sk/images/taskman-logo.svg"
              alt="ui42 logo"
              width={48}
              height={48}
              className="flex-shrink-0"
              unoptimized
            />
            <span className="flex flex-col leading-tight">
              <span className="font-bold text-xl leading-[20px]">Workflows</span>
              <small className="text-[#cccccc]">by ui42</small>
            </span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            {user.picture ? (
              <Image
                src={user.picture}
                alt={user.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <span className="text-[10px] font-semibold text-white">
                {user.name
                  .split(' ')
                  .reverse()
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>
          <span className="hidden sm:block font-medium text-white/90">
            {user.name.split(' ').reverse().join(' ')}
          </span>
          <span className="text-white/30 select-none hidden sm:block">|</span>
          <LogoutButton />
        </div>
      </div>

      <div
        id="header-meta"
        data-pending={pendingApprovalsCount}
        data-admin={isAdmin ? 'true' : 'false'}
        className="hidden"
      />
    </header>
  );
}
