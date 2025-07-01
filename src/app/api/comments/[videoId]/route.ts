import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, stat, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Comment } from '@/lib/types';

// Note: The dynamic route parameter is named 'videoId' due to the file name,
// but it actually contains the project 'slug'.
const getCommentFilePath = (slug: string) => {
    if (!slug || typeof slug !== 'string' || slug.includes('..')) {
        throw new Error('Invalid slug');
    }
    const commentsDir = path.join(process.cwd(), 'uploads', 'comments');
    return path.join(commentsDir, `${slug}.json`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } } // videoId is the slug
) {
  try {
    const slug = params.videoId;
    const filePath = getCommentFilePath(slug);
    await stat(filePath); // Check if file exists
    const fileContent = await readFile(filePath, 'utf-8');
    const comments = JSON.parse(fileContent);

    return NextResponse.json(comments);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      // If the comment file doesn't exist for the slug, return an empty array.
      return NextResponse.json([]);
    }
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } } // videoId is the slug
) {
  try {
    const slug = params.videoId;
    const filePath = getCommentFilePath(slug);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { videoId: string } } // videoId is the slug
) {
  try {
    const slug = params.videoId;
    const filePath = getCommentFilePath(slug);
    const { commentId, text } = await request.json();

    if (!commentId || !text) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    let comments: Comment[] = [];
    try {
      const fileContent = await readFile(filePath, 'utf-8');
      comments = JSON.parse(fileContent);
    } catch (e) {
      // This should not happen if we are editing a comment, as the file must exist.
      return NextResponse.json({ error: 'Comment data not found' }, { status: 404 });
    }

    const commentIndex = comments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    const updatedComment = { ...comments[commentIndex], text };
    comments[commentIndex] = updatedComment;
    
    await writeFile(filePath, JSON.stringify(comments, null, 2));

    return NextResponse.json(updatedComment, { status: 200 });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
