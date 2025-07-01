import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found.' }, { status: 400 });
    }
     if (!file.type.startsWith('video/')) {
      return NextResponse.json({ success: false, error: 'Invalid file type.' }, { status: 400 });
    }


    const videoId = randomUUID();
    const fileExtension = path.extname(file.name) || '.mp4';
    const newFilename = `${videoId}${fileExtension}`;

    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    const commentsDir = path.join(process.cwd(), 'uploads', 'comments');

    // Ensure directories exist
    await mkdir(videosDir, { recursive: true });
    await mkdir(commentsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const videoPath = path.join(videosDir, newFilename);
    await writeFile(videoPath, buffer);

    const commentPath = path.join(commentsDir, `${videoId}.json`);
    await writeFile(commentPath, JSON.stringify([]));

    return NextResponse.json({ success: true, videoId: videoId, filename: newFilename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
