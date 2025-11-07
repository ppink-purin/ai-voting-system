import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, presentationId, rating } = body;

    // Validation
    if (!sessionId || !presentationId || rating === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
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

    // Check if user exists
    const user = await db.getUser(sessionId);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 404 }
      );
    }

    // Save vote
    await db.saveVote(sessionId, presentationId, rating);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
