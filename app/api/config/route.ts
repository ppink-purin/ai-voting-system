import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const config = await db.getConfig();

  return NextResponse.json({
    votingActive: config.votingActive,
    requiredSelections: config.requiredSelections,
    lastConfigUpdate: config.lastConfigUpdate,
    selectedTheme: config.selectedTheme,
    randomTheme: config.randomTheme,
  });
}
