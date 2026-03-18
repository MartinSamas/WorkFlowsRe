import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { authenticateRequest } from '../../middleware/auth';
import { handleError } from '../../lib/errors';

export async function GET() {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await db.isAdmin(user.email);
    return NextResponse.json({ data: { isAdmin } });
  } catch (error) {
    return handleError(error, 'GET /api/admin/me');
  }
}
