import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat, readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { VideoProject } from '@/lib/types';
import slugify from 'slugify';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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
    return `${slug}-${randomUUID().slice(0, 3)}`;
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

    const videoId = randomUUID().slice(0, 4);
    const fileExtension = path.extname(file.name) || '.mp4';
    const newFilename = `${videoId}${fileExtension}`;
    
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    const commentsDir = path.join(process.cwd(), 'uploads', 'comments');
    const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
    const thumbnailsDir = path.join(process.cwd(), 'uploads', 'thumbnails');
    
    await mkdir(videosDir, { recursive: true });
    await mkdir(commentsDir, { recursive: true });
    await mkdir(metadataDir, { recursive: true });
    await mkdir(thumbnailsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const videoPath = path.join(videosDir, newFilename);
    await writeFile(videoPath, buffer);

    const thumbnailFilename = `${videoId}.jpg`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

    await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(new Error(`FFMPEG error: ${err.message}`)))
            .screenshots({
                timestamps: ['00:00:01.000'],
                filename: thumbnailFilename,
                folder: thumbnailsDir,
                size: '1200x630'
            });
    });
    
    let project: VideoProject;
    let finalSlug: string;

    if (existingSlug) {
        // This is a new version of an existing project. Comments file already exists.
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
            originalName: file.name,
            thumbnailFilename: thumbnailFilename
        });

        await writeFile(metadataPath, JSON.stringify(project, null, 2));
    } else {
        // This is a new project
        const baseSlug = slugify(file.name.replace(/\.[^/.]+$/, ""), { lower: true, strict: true }) || `project-${randomUUID().slice(0,3)}`;
        finalSlug = await findUniqueSlug(baseSlug, metadataDir);
        
        // Create the comment file for the new project, tied to the slug
        const commentPath = path.join(commentsDir, `${finalSlug}.json`);
        await writeFile(commentPath, JSON.stringify([]));

        project = {
            slug: finalSlug,
            originalName: file.name,
            createdAt: new Date().toISOString(),
            versions: [{
                version: 1,
                videoId: videoId,
                uploadedAt: new Date().toISOString(),
                originalName: file.name,
                thumbnailFilename: thumbnailFilename
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
