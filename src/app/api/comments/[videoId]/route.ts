import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, stat, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Comment } from '@/lib/types';
import { statSync } from 'fs';

const getCommentFilePath = (videoId: string) => {
    if (!videoId || typeof videoId !== 'string' || videoId.includes('..')) {
        throw new Error('Invalid video ID');
    }
    const commentsDir = path.join(process.cwd(), 'uploads', 'comments');
    return path.join(commentsDir, `${videoId}.json`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const filePath = getCommentFilePath(params.videoId);
    await stat(filePath); // Check if file exists
    const fileContent = await readFile(filePath, 'utf-8');
    const comments = JSON.parse(fileContent);

    return NextResponse.json(comments);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json([]);
    }
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;
    const filePath = getCommentFilePath(videoId);
    const { text, timestamp } = await request.json();

    if (!text || typeof timestamp !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    await mkdir(path.dirname(filePath), { recursive: true });

    let comments: Comment[] = [];

    try {
      await stat(filePath);
      const fileContent = await readFile(filePath, 'utf-8');
      comments = JSON.parse(fileContent);
    } catch (e) {
      // File doesn't exist, will be created.
    }

    const newComment: Comment = {
      id: randomUUID(),
      text,
      timestamp,
      author: 'Anonymous',
    };

    comments.push(newComment);
    await writeFile(filePath, JSON.stringify(comments, null, 2));

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
