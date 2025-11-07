import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: Request) {
  // Check admin authentication
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allVotes = await db.getAllVotes();

  // Convert Map to array format
  const votesArray = Array.from(allVotes.entries()).map(([sessionId, votes]) => ({
    sessionId,
    votes,
  }));

  return NextResponse.json({ votes: votesArray });
}
