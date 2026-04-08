import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { authenticateRequest } from '../../middleware/auth';
import { handleError } from '../../lib/errors';
import type { RequestWithApprovals } from '../../types';
import type { RequestFilters } from '@/backend/db/database';

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as RequestFilters['status'] | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    const filters: RequestFilters = { user_email: user.email, limit: limitNum, offset: offsetNum };
    if (status) filters.status = status;

    let requests = await db.getAllRequests(filters);

    const requestIds = requests.map((r) => r.id);
    const allApprovals = await db.getApprovalsByRequests(requestIds);
    const approvalsByRequestId = new Map<number, typeof allApprovals>();
    for (const approval of allApprovals) {
      if (!approvalsByRequestId.has(approval.request_id)) {
        approvalsByRequestId.set(approval.request_id, []);
      }
      approvalsByRequestId.get(approval.request_id)!.push(approval);
    }

    const requestsWithApprovals: RequestWithApprovals[] = requests.map((req) => ({
      ...req,
      approvals: approvalsByRequestId.get(req.id) || [],
    }));

    return NextResponse.json({ data: requestsWithApprovals });
  } catch (error) {
    return handleError(error, 'GET /api/me/requests');
  }
}
