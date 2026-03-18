import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/backend/lib/db';
import { authenticateRequest } from '../../middleware/auth';
import { handleError } from '../../lib/errors';

const addApproverSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('individual'),
    name: z.string().min(1),
    email: z.string().email(),
    role: z.string().optional(),
  }),
  z.object({
    type: z.literal('group'),
    name: z.string().min(1),
    email: z.string().email(),
    role: z.string().optional(),
  }),
]);

/** GET /api/admin/approvers — accessible to all authenticated users (needed by new-request dialog) */
export async function GET() {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const approvers = await db.getApprovers();
    return NextResponse.json({ data: approvers });
  } catch (error) {
    return handleError(error, 'GET /api/admin/approvers');
  }
}

/** POST /api/admin/approvers — admin only */
export async function POST(request: Request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await db.isAdmin(user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = addApproverSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 },
      );
    }

    const data = validation.data;
    
    let group_emails: string[] | undefined = undefined;
    if (data.type === 'group') {
      try {
        const { getGoogleGroupMembers } = await import('@/backend/lib/google-groups');
        group_emails = await getGoogleGroupMembers(data.email);
        if (group_emails.length === 0) {
          throw new Error('Google group was found but has no user members.');
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message || 'Failed to fetch members from Google' },
          { status: 400 }
        );
      }
    }

    const approver = await db.addApprover({
      type: data.type,
      name: data.name,
      email: data.email,
      role: data.role,
      group_emails,
    });

    return NextResponse.json({ data: approver }, { status: 201 });
  } catch (error) {
    return handleError(error, 'POST /api/admin/approvers');
  }
}
