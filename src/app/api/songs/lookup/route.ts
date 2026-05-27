import { NextRequest, NextResponse } from 'next/server';
import {
  searchSongFiles,
  isSongsDirectoryReady,
} from '@/lib/songDirectoryService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const ready = await isSongsDirectoryReady();
  if (!ready) {
    return NextResponse.json({ error: 'Songs directory is not ready. Please wait for initialization.' }, { status: 503 });
  }

  const results = await searchSongFiles(query.trim());
  return NextResponse.json({ results });
}
