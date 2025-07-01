import { NextRequest, NextResponse } from 'next/server';
import { stat, readFile, readdir } from 'fs/promises';
import path from 'path';
import { statSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;
    if (!videoId || typeof videoId !== 'string' || videoId.includes('..')) {
        return new NextResponse('Invalid video ID', { status: 400 });
    }

    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    
    // Find the file with the matching videoId, regardless of extension
    const files = await readdir(videosDir);
    const filename = files.find(file => file.startsWith(videoId));

    if (!filename) {
      return new NextResponse('Video not found', { status: 404 });
    }

    const filePath = path.join(videosDir, filename);

    // Ensure the resolved path is within the intended directory
    if (!filePath.startsWith(videosDir)) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const fileStat = statSync(filePath);
    const file = await readFile(filePath);

    const headers = new Headers();
    headers.set('Content-Length', fileStat.size.toString());
    const fileExtension = path.extname(filename).toLowerCase();
    let contentType = 'video/mp4'; // Default
    if (fileExtension === '.webm') contentType = 'video/webm';
    if (fileExtension === '.ogv') contentType = 'video/ogg';
    if (fileExtension === '.mov') contentType = 'video/quicktime';
    headers.set('Content-Type', contentType);
    headers.set('Accept-Ranges', 'bytes');

    return new NextResponse(file, { status: 200, headers });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return new NextResponse('Video not found', { status: 404 });
    }
    console.error('Video serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
