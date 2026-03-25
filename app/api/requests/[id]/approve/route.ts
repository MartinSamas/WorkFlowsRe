import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { createHolidayEvent } from '@/backend/lib/google-calendar';
import { authenticateRequest } from '../../../middleware/auth';
import { approvalDecisionSchema } from '../../../lib/validation';
import { handleError, NotFoundError, ForbiddenError } from '../../../lib/errors';
import type { RequestWithApprovals } from '../../../types';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(rawId, 10);
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

    // Check direct approval row first
    let userApproval = approvals.find(
      (a) => a.approver_email.toLowerCase() === user.email.toLowerCase(),
    );

    // If not found directly, check if user is a member of a group that has an approval row
    if (!userApproval) {
      const allApprovers = await db.getApprovers();
      const groupsUserBelongsTo = allApprovers
        .filter(
          (a) =>
            a.type === 'group' &&
            a.group_emails?.some((e) => e.toLowerCase() === user.email.toLowerCase()),
        )
        .map((g) => g.email);

      userApproval = approvals.find((a) =>
        groupsUserBelongsTo.some(
          (ge) => ge.toLowerCase() === a.approver_email.toLowerCase(),
        ),
      );
    }

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

    if (requestStatus === 'approved') {
      try {
        await createHolidayEvent(updatedRequest);
      } catch (e) {
        console.error('Error creating calendar event:', e);
      }
    }

    const result: RequestWithApprovals = {
      ...updatedRequest,
      approvals: updatedApprovals,
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleError(error, `POST /api/requests/${rawId}/approve`);
  }
}
