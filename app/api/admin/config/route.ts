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
    const { requiredSelections } = body;

    // Validation
    if (requiredSelections === undefined || requiredSelections < 1) {
      return NextResponse.json(
        { error: 'Required selections must be at least 1' },
        { status: 400 }
      );
    }

    await db.updateRequiredSelections(requiredSelections);
    await db.resetAllVotes();

    return NextResponse.json({ success: true, message: '필요 선택 갯수가 변경되고 모든 투표가 초기화되었습니다.' });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
