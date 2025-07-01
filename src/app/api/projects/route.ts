import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import type { VideoProject } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
    
    try {
        await stat(metadataDir);
    } catch (e) {
        // If metadata directory doesn't exist, return empty array
        return NextResponse.json([]);
    }

    const files = await readdir(metadataDir);
    
    const videoProjects: VideoProject[] = [];

    for (const file of files) {
        if (path.extname(file) === '.json') {
            const filePath = path.join(metadataDir, file);
            const fileContent = await readFile(filePath, 'utf-8');
            try {
                const project = JSON.parse(fileContent);
                if (project.versions && project.versions.length > 0) {
                    // Sort versions descending
                    project.versions.sort((a: any, b: any) => b.version - a.version);
                    videoProjects.push(project);
                }
            } catch (e) {
                console.error(`Could not parse JSON for ${file}`, e);
            }
        }
    }
    
    // Sort projects by most recent version upload
    videoProjects.sort((a, b) => {
        const lastVersionA = new Date(a.versions[0]?.uploadedAt || 0).getTime();
        const lastVersionB = new Date(b.versions[0]?.uploadedAt || 0).getTime();
        return lastVersionB - lastVersionA;
    });

    return NextResponse.json(videoProjects);
  } catch (error) {
    console.error('Error fetching video projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
