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
    const { presentations } = body;

    // Validation
    if (!presentations || !Array.isArray(presentations)) {
      return NextResponse.json(
        { error: 'Invalid presentations data' },
        { status: 400 }
      );
    }

    // Validate presentation structure
    for (const pres of presentations) {
      if (!pres.id || !pres.teamName || !pres.title) {
        return NextResponse.json(
          { error: 'Each presentation must have id, teamName, and title' },
          { status: 400 }
        );
      }
    }

    await db.updatePresentations(presentations);
    await db.resetAllVotes();

    return NextResponse.json({ success: true, message: '발표 데이터가 업데이트되고 모든 투표가 초기화되었습니다.' });
  } catch (error) {
    console.error('Error updating presentations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
