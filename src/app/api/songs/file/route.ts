import { NextRequest, NextResponse } from 'next/server';
import { getSongFileBuffer } from '@/lib/songDirectoryService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const relativePath = request.nextUrl.searchParams.get('path');
  if (!relativePath) {
    return NextResponse.json({ error: 'Query parameter "path" is required' }, { status: 400 });
  }

  try {
    const { buffer, mimeType } = getSongFileBuffer(relativePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(relativePath.split('/').pop() || 'file')}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to read file';
    const status = message === 'Invalid file path' || message === 'File not found' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
