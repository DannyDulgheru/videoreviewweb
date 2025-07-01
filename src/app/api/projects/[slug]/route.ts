import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink, readdir } from 'fs/promises';
import path from 'path';
import type { VideoProject } from '@/lib/types';

const getMetadataPath = (slug: string) => {
    if (!slug || typeof slug !== 'string' || slug.includes('..')) {
        throw new Error('Invalid slug');
    }
    return path.join(process.cwd(), 'uploads', 'metadata', `${slug}.json`);
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const { slug } = params;
        const filePath = getMetadataPath(slug);
        const fileContent = await readFile(filePath, 'utf-8');
        const project: VideoProject = JSON.parse(fileContent);
        // Sort versions descending
        project.versions.sort((a, b) => b.version - a.version);
        return NextResponse.json(project);
    } catch (error) {
         if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        console.error('Error fetching project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const { slug } = params;
        const metadataPath = getMetadataPath(slug);

        const fileContent = await readFile(metadataPath, 'utf-8');
        const project: VideoProject = JSON.parse(fileContent);

        const videosDir = path.join(process.cwd(), 'uploads', 'videos');
        const commentsDir = path.join(process.cwd(), 'uploads', 'comments');

        for (const version of project.versions) {
            // Delete video file
            try {
                const videoFiles = await readdir(videosDir);
                const videoFilename = videoFiles.find(file => file.startsWith(version.videoId));
                if (videoFilename) {
                    await unlink(path.join(videosDir, videoFilename));
                }
            } catch (e) {
                 console.error(`Could not delete video for videoId ${version.videoId}`, e);
            }
            
            // Delete comments file
            const commentPath = path.join(commentsDir, `${version.videoId}.json`);
            try {
                await unlink(commentPath);
            } catch (e) {
                if (e instanceof Error && 'code' in e && e.code !== 'ENOENT') {
                    console.error(`Could not delete comments for videoId ${version.videoId}`, e);
                }
            }
        }

        // Delete metadata file
        await unlink(metadataPath);

        return NextResponse.json({ success: true, message: 'Project deleted successfully.' });

    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
