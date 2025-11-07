import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST() {
  // Generate unique session ID
  const sessionId = randomBytes(16).toString('hex');

  // Create user in database
  await db.createUser(sessionId);

  return NextResponse.json({ sessionId });
}
