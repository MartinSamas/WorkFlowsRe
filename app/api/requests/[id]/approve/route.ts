import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { authenticateRequest } from '../../../middleware/auth';
import { approvalDecisionSchema } from '../../../lib/validation';
import { handleError, NotFoundError, ForbiddenError } from '../../../lib/errors';
import type { RequestWithApprovals } from '../../../types';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const req = await db.getRequestById(id);
    if (!req) {
      throw new NotFoundError(`Request ${id} not found`);
    }

    if (req.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been resolved' },
        { status: 400 },
      );
    }

    const approvals = await db.getApprovalsByRequest(id);
    const userApproval = approvals.find((a) => a.approver_email === user.email);
    if (!userApproval) {
      throw new ForbiddenError('You are not an approver for this request');
    }

    if (userApproval.status !== 'pending') {
      return NextResponse.json(
        { error: 'You have already responded to this request' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = approvalDecisionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 },
      );
    }

    const { status, decision_notes } = validation.data;

    await db.updateApproval(userApproval.id, {
      status,
      decision_notes: decision_notes ?? undefined,
      responded_at: new Date(),
    });

    const updatedApprovals = await db.getApprovalsByRequest(id);

    let requestStatus: 'pending' | 'approved' | 'denied' = 'pending';
    if (status === 'denied') {
      requestStatus = 'denied';
    } else {
      const allApproved = updatedApprovals.every((a) => a.status === 'approved');
      if (allApproved) requestStatus = 'approved';
    }

    const updatedRequest =
      requestStatus !== 'pending'
        ? await db.updateRequest(id, { status: requestStatus })
        : req;

    const result: RequestWithApprovals = {
      ...updatedRequest,
      approvals: updatedApprovals,
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleError(error, `POST /api/requests/${params.id}/approve`);
  }
}
