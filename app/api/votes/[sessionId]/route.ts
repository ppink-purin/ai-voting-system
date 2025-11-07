import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = params.sessionId;

  const user = await db.getUser(sessionId);
  if (!user) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const votes = await db.getUserVotes(sessionId);

  return NextResponse.json({ votes });
}
