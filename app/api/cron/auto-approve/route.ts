import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { countWorkdays } from '@/lib/date-utils';
import { sendRequestResultNotification } from '@/backend/lib/mailer';

export const dynamic = 'force-dynamic';

// 0 0 * * * curl -X POST -H "Authorization: Bearer <YOUR_CRON_SECRET>" http://localhost:3000/api/cron/auto-approve
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const autoApproveDaysStr = await db.getSetting('auto_approve_days');
    if (!autoApproveDaysStr) {
      return NextResponse.json({ message: 'Auto-approve feature is disabled or not configured' }, { status: 200 });
    }

    const autoApproveDaysLimit = parseInt(autoApproveDaysStr, 10);
    if (isNaN(autoApproveDaysLimit) || autoApproveDaysLimit <= 0) {
      return NextResponse.json({ message: 'Auto-approve days is set to an invalid value' }, { status: 200 });
    }

    const pendingRequests = await db.getAllRequests({ status: 'pending' });

    let approvedCount = 0;
    const now = new Date();

    for (const request of pendingRequests) {
      // countWorkdays includes both start and end, so e.g. Monday to Tuesday is 2 days.
      // If we want "approved after X full working days", we subtract 1.
      const workdaysElapsed = countWorkdays(request.created_at, now) - 1;

      if (workdaysElapsed >= autoApproveDaysLimit) {
        // Update request to approved
        await db.updateRequest(request.id, {
          status: 'approved',
          admin_notes: `Automatically approved after ${autoApproveDaysLimit} working days.`
        });

        // Mark all linked pending approvals as approved
        const approvals = await db.getApprovalsByRequest(request.id);
        for (const approval of approvals) {
          if (approval.status === 'pending') {
            await db.updateApproval(approval.id, {
              status: 'approved',
              decision_notes: 'System Auto-Approve',
              responded_at: new Date()
            });
          }
        }

        const updatedRequest = await db.getRequestById(request.id);
        if (updatedRequest) {
          await sendRequestResultNotification(updatedRequest);
        }

        approvedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      evaluated: pendingRequests.length,
      approved: approvedCount
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to run auto-approve cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
