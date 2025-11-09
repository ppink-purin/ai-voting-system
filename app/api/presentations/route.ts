import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import defaultPresentations from '@/data/presentations.json';

export async function GET() {
  const config = await db.getConfig();

  // 초기 로딩 시 JSON 파일 데이터로 초기화
  if (config.presentations.length === 0) {
    await db.updatePresentations(defaultPresentations.presentations);
  }

  const updatedConfig = await db.getConfig();
  return NextResponse.json({ presentations: updatedConfig.presentations });
}
