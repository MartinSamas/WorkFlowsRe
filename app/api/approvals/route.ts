import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { authenticateRequest } from '../middleware/auth';
import { handleError } from '../lib/errors';
import type { RequestWithApprovals } from '../types';

export async function GET() {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find group approvers that this user is a member of
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

    // Merge and de-duplicate by approval id
    const approvalMap = new Map(
      [...directApprovals, ...groupApprovals].map((a) => [a.id, a]),
    );
    const pendingApprovals = Array.from(approvalMap.values()).filter(
      (a) => a.status === 'pending',
    );

    const requestsWithApprovals: RequestWithApprovals[] = (
      await Promise.all(
        pendingApprovals.map(async (approval) => {
          const req = await db.getRequestById(approval.request_id);
          if (!req || req.status !== 'pending') return null;
          return {
            ...req,
            approvals: await db.getApprovalsByRequest(req.id),
          } as RequestWithApprovals;
        }),
      )
    ).filter((r): r is RequestWithApprovals => r !== null);

    // De-duplicate requests (user could be dir + group approver on same request)
    const uniqueRequests = Array.from(
      new Map(requestsWithApprovals.map((r) => [r.id, r])).values(),
    );

    return NextResponse.json({
      data: uniqueRequests,
      meta: { currentUserEmail: user.email },
    });
  } catch (error) {
    return handleError(error, 'GET /api/approvals');
  }
}
