import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat, readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { VideoProject } from '@/lib/types';

const slugify = (text: string) => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

async function findUniqueSlug(slug: string, metadataDir: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;
    const maxAttempts = 10;
    while(counter <= maxAttempts) {
        try {
            const filePath = path.join(metadataDir, `${uniqueSlug}.json`);
            await stat(filePath);
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        } catch (e) {
            return uniqueSlug;
        }
    }
    return `${slug}-${randomUUID().slice(0, 6)}`;
}


export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const existingSlug: string | null = data.get('slug') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found.' }, { status: 400 });
    }
     if (!file.type.startsWith('video/')) {
      return NextResponse.json({ success: false, error: 'Invalid file type.' }, { status: 400 });
    }

    const videoId = randomUUID().slice(0, 8);
    const fileExtension = path.extname(file.name) || '.mp4';
    const newFilename = `${videoId}${fileExtension}`;
    
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    const commentsDir = path.join(process.cwd(), 'uploads', 'comments');
    const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
    
    await mkdir(videosDir, { recursive: true });
    await mkdir(commentsDir, { recursive: true });
    await mkdir(metadataDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const videoPath = path.join(videosDir, newFilename);
    await writeFile(videoPath, buffer);

    const commentPath = path.join(commentsDir, `${videoId}.json`);
    await writeFile(commentPath, JSON.stringify([]));
    
    let project: VideoProject;
    let finalSlug: string;

    if (existingSlug) {
        // This is a new version of an existing project
        finalSlug = existingSlug;
        const metadataPath = path.join(metadataDir, `${finalSlug}.json`);
        const fileContent = await readFile(metadataPath, 'utf-8');
        project = JSON.parse(fileContent);
        
        const newVersionNumber = project.versions.length > 0
            ? Math.max(...project.versions.map(v => v.version)) + 1
            : 1;

        project.versions.push({
            version: newVersionNumber,
            videoId: videoId,
            uploadedAt: new Date().toISOString(),
            originalName: file.name
        });

        await writeFile(metadataPath, JSON.stringify(project, null, 2));
    } else {
        // This is a new project
        const originalNameWithoutExt = path.parse(file.name).name;
        const baseSlug = slugify(originalNameWithoutExt) || 'video';
        finalSlug = await findUniqueSlug(baseSlug, metadataDir);
        
        project = {
            slug: finalSlug,
            originalName: file.name,
            versions: [{
                version: 1,
                videoId: videoId,
                uploadedAt: new Date().toISOString(),
                originalName: file.name
            }]
        };

        const metadataPath = path.join(metadataDir, `${finalSlug}.json`);
        await writeFile(metadataPath, JSON.stringify(project, null, 2));
    }

    return NextResponse.json({ success: true, videoId: videoId, slug: finalSlug });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
