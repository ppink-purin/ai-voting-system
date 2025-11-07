import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(request: Request) {
  // Check admin authentication
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { active } = body;

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: active must be a boolean' },
        { status: 400 }
      );
    }

    await db.setVotingStatus(active);

    return NextResponse.json({
      success: true,
      votingActive: active,
    });
  } catch (error) {
    console.error('Error toggling voting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
