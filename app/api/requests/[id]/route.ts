import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { authenticateRequest } from '../../middleware/auth';
import { updateRequestSchema } from '../../lib/validation';
import { handleError, NotFoundError, ForbiddenError } from '../../lib/errors';
import type { RequestWithApprovals } from '../../types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const isAdmin = user.email.endsWith('@admin.com');
    if (!isAdmin && req.user_email !== user.email) {
      throw new ForbiddenError('You do not have permission to view this request');
    }

    const result: RequestWithApprovals = {
      ...req,
      approvals: await db.getApprovalsByRequest(id),
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleError(error, `GET /api/requests/${params.id}`);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    if (req.user_email !== user.email) {
      throw new ForbiddenError('You do not have permission to update this request');
    }

    if (req.status === 'approved' || req.status === 'denied') {
      return NextResponse.json(
        { error: 'Cannot update a request that has already been approved or denied' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = updateRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 },
      );
    }

    const updated = await db.updateRequest(id, validation.data);

    const result: RequestWithApprovals = {
      ...updated,
      approvals: await db.getApprovalsByRequest(id),
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    return handleError(error, `PATCH /api/requests/${params.id}`);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    if (req.user_email !== user.email) {
      throw new ForbiddenError('You do not have permission to delete this request');
    }

    if (req.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending requests can be deleted' },
        { status: 400 },
      );
    }

    await db.deleteRequest(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error, `DELETE /api/requests/${params.id}`);
  }
}
