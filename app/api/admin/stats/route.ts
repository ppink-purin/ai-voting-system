import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';
import defaultPresentations from '@/data/presentations.json';

export async function GET(request: Request) {
  // Check admin authentication
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await db.getStats();
  const votingActive = await db.getVotingStatus();
  const config = await db.getConfig();

  // 초기 로딩 시 JSON 파일 데이터로 초기화
  if (config.presentations.length === 0) {
    await db.updatePresentations(defaultPresentations.presentations);
  }

  const updatedConfig = await db.getConfig();

  // Create a map of presentationId to selectionCount
  const voteCountMap = new Map<number, number>();
  stats.presentationStats.forEach(stat => {
    voteCountMap.set(stat.presentationId, stat.selectionCount);
  });

  // Include ALL presentations from updatedConfig, with 0 votes if not voted for
  const presentationStatsWithNames = updatedConfig.presentations.map(presentation => {
    return {
      presentationId: presentation.id,
      teamName: presentation.teamName,
      title: presentation.title,
      selectionCount: voteCountMap.get(presentation.id) || 0,
    };
  });

  // Sort by selection count descending
  presentationStatsWithNames.sort((a, b) => b.selectionCount - a.selectionCount);

  return NextResponse.json({
    totalUsers: stats.totalUsers,
    votingActive,
    requiredSelections: updatedConfig.requiredSelections,
    presentations: presentationStatsWithNames,
    selectedTheme: updatedConfig.selectedTheme,
    randomTheme: updatedConfig.randomTheme,
  });
}
