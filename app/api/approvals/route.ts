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

    const approvals = await db.getApprovalsByApprover(user.email);
    const pendingApprovals = approvals.filter((a) => a.status === 'pending');

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

    return NextResponse.json({
      data: requestsWithApprovals,
      meta: { currentUserEmail: user.email },
    });
  } catch (error) {
    return handleError(error, 'GET /api/approvals');
  }
}
