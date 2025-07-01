import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { VideoProject } from '@/lib/types';
import { deleteProjectBySlug } from '@/lib/project-actions';

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

        // Lazily delete expired projects on access
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        if (project.createdAt && new Date(project.createdAt) < twoWeeksAgo) {
            await deleteProjectBySlug(slug);
            return NextResponse.json({ error: 'Project expired and has been deleted' }, { status: 410 }); // 410 Gone
        }

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

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const { slug } = params;
        const { originalName } = await request.json();

        if (!originalName) {
            return NextResponse.json({ error: 'New name is required' }, { status: 400 });
        }
        
        const metadataPath = getMetadataPath(slug);
        const fileContent = await readFile(metadataPath, 'utf-8');
        const project: VideoProject = JSON.parse(fileContent);

        project.originalName = originalName;

        await writeFile(metadataPath, JSON.stringify(project, null, 2));

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
         if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
    try {
        await deleteProjectBySlug(params.slug);
        return NextResponse.json({ success: true, message: 'Project deleted successfully.' });
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            // This can happen if the project was already deleted but a delete request was sent again.
            // It's safe to return success in this case.
            return NextResponse.json({ success: true, message: 'Project already deleted.' });
        }
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
