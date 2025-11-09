import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, selectedPresentationIds, configTimestamp } = body;

    // Validation
    if (!sessionId || !selectedPresentationIds || !Array.isArray(selectedPresentationIds)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if voting is active
    const votingActive = await db.getVotingStatus();
    if (!votingActive) {
      return NextResponse.json(
        { error: 'Voting has ended' },
        { status: 403 }
      );
    }

    // Get config to validate selection count
    const config = await db.getConfig();

    // Check if config has changed since page load
    if (configTimestamp && configTimestamp !== config.lastConfigUpdate) {
      return NextResponse.json(
        { error: 'Config changed', requireReload: true },
        { status: 409 }
      );
    }

    if (selectedPresentationIds.length !== config.requiredSelections) {
      return NextResponse.json(
        { error: `정확히 ${config.requiredSelections}개의 팀을 선택해야 합니다` },
        { status: 400 }
      );
    }

    // Check if user exists, create if not (Vercel serverless environment)
    let user = await db.getUser(sessionId);
    if (!user) {
      // 서버리스 환경에서 세션이 없으면 자동 생성
      user = await db.createUser(sessionId);
    }

    // Save votes
    await db.saveVotes(sessionId, selectedPresentationIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
