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

    const filters: RequestFilters = { user_email: user.email };
    if (status) filters.status = status;

    let requests = await db.getAllRequests(filters);

    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    if (offsetNum > 0) requests = requests.slice(offsetNum);
    if (limitNum !== undefined) requests = requests.slice(0, limitNum);

    const requestsWithApprovals: RequestWithApprovals[] = await Promise.all(
      requests.map(async (req) => ({
        ...req,
        approvals: await db.getApprovalsByRequest(req.id),
      })),
    );

    return NextResponse.json({ data: requestsWithApprovals });
  } catch (error) {
    return handleError(error, 'GET /api/me/requests');
  }
}
