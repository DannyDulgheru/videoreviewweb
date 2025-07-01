import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { thumbnailId: string } }
) {
  try {
    const { thumbnailId } = params;
    if (!thumbnailId || typeof thumbnailId !== 'string' || thumbnailId.includes('..')) {
        return new NextResponse('Invalid thumbnail ID', { status: 400 });
    }

    const thumbnailsDir = path.join(process.cwd(), 'uploads', 'thumbnails');
    const filePath = path.join(thumbnailsDir, thumbnailId);

    // Ensure the resolved path is within the intended directory
    if (!filePath.startsWith(thumbnailsDir)) {
        return new NextResponse('Forbidden', { status: 403 });
    }
    
    const fileStat = await stat(filePath);
    const fileBuffer = await readFile(filePath);
    
    return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': fileStat.size.toString(),
            'Cache-Control': 'public, max-age=604800, immutable', // Cache for a week
        },
    });

  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return new NextResponse('Thumbnail not found', { status: 404 });
    }
    console.error('Thumbnail serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
