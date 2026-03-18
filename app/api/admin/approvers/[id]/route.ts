import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { authenticateRequest } from '../../../middleware/auth';
import { handleError } from '../../../lib/errors';

/** DELETE /api/admin/approvers/[id] — admin only */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await db.isAdmin(user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid approver ID' }, { status: 400 });
    }

    await db.removeApprover(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error, `DELETE /api/admin/approvers/${rawId}`);
  }
}
