import { NextResponse } from 'next/server';
import { ensureSongsDirectoryReady } from '@/lib/songDirectoryService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await ensureSongsDirectoryReady();
  return NextResponse.json(result, { status: result.ready ? 200 : 500 });
}
