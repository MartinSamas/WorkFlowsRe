import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { authenticateRequest } from '../middleware/auth';
import { createRequestSchema } from '../lib/validation';
import { handleError } from '../lib/errors';
import type { RequestWithApprovals } from '../types';
import type { RequestFilters } from '@/backend/db/database';

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as RequestFilters['status'] | null;
    const userEmail = searchParams.get('userEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const filters: RequestFilters = {};
    if (status) filters.status = status;
    if (startDate) filters.start_date_from = new Date(startDate);
    if (endDate) filters.start_date_to = new Date(endDate);

    // Admins (those with query param userEmail) can filter by user; otherwise only own requests
    const isAdmin = user.email.endsWith('@admin.com');
    if (isAdmin && userEmail) {
      filters.user_email = userEmail;
    } else if (!isAdmin) {
      filters.user_email = user.email;
    }

    let requests = await db.getAllRequests(filters);

    // Apply pagination
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
    return handleError(error, 'GET /api/requests');
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const validation = createRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 },
      );
    }

    const { start_date, end_date, request_type, notes, approvers } = validation.data;

    const newRequest = await db.createRequest({
      user_email: user.email,
      user_name: user.name,
      user_picture: user.picture,
      request_time: new Date(),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      request_type: request_type ?? 'vacation',
      status: 'pending',
      notes: notes ?? undefined,
      admin_notes: undefined,
    });

    for (const approver of approvers) {
      await db.createApproval({
        request_id: newRequest.id,
        approver_email: approver.email,
        approver_name: approver.name,
        approver_role: approver.role,
        status: 'pending',
        decision_notes: undefined,
        responded_at: undefined,
      });
    }

    const requestWithApprovals: RequestWithApprovals = {
      ...newRequest,
      approvals: await db.getApprovalsByRequest(newRequest.id),
    };

    return NextResponse.json(
      { data: requestWithApprovals, message: 'Request created successfully' },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error, 'POST /api/requests');
  }
}
