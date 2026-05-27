import { NextResponse } from 'next/server';
import { hasSongFolders } from '@/lib/songDirectoryService';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ready: hasSongFolders() });
}
