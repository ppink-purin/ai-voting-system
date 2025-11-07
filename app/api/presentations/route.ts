import { NextResponse } from 'next/server';
import presentations from '@/data/presentations.json';

export async function GET() {
  return NextResponse.json(presentations);
}
