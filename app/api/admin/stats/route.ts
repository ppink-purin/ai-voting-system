import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';
import presentations from '@/data/presentations.json';

export async function GET(request: Request) {
  // Check admin authentication
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await db.getStats();
  const votingActive = await db.getVotingStatus();

  // Merge with presentation data
  const presentationStatsWithNames = stats.presentationStats.map(stat => {
    const presentation = presentations.presentations.find(p => p.id === stat.presentationId);
    return {
      ...stat,
      teamName: presentation?.teamName || 'Unknown',
      title: presentation?.title || 'Unknown',
    };
  });

  // Sort by average rating descending
  presentationStatsWithNames.sort((a, b) => b.averageRating - a.averageRating);

  return NextResponse.json({
    totalUsers: stats.totalUsers,
    votingActive,
    presentations: presentationStatsWithNames,
  });
}
