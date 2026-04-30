import { NextResponse } from 'next/server';
import { db } from '@/backend/lib/db';
import { getCurrentUser } from '@/lib/actions';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = await db.isAdmin(user.email);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const autoApproveDays = await db.getSetting('auto_approve_days');
    return NextResponse.json({
      auto_approve_days: autoApproveDays ? parseInt(autoApproveDays, 10) : ''
    });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = await db.isAdmin(user.email);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { auto_approve_days } = body;

    if (auto_approve_days !== undefined) {
      await db.setSetting('auto_approve_days', auto_approve_days.toString());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

