'use server';

import { readFile, unlink, readdir, stat } from 'fs/promises';
import path from 'path';
import type { VideoProject } from '@/lib/types';

export async function deleteProjectBySlug(slug: string): Promise<void> {
    const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
    const metadataPath = path.join(metadataDir, `${slug}.json`);

    try {
        await stat(metadataPath);
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            // File doesn't exist, so nothing to delete.
            console.log(`Project metadata for ${slug} not found, skipping deletion.`);
            return;
        }
        throw error; // Re-throw other errors
    }

    const fileContent = await readFile(metadataPath, 'utf-8');
    const project: VideoProject = JSON.parse(fileContent);

    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    const commentsDir = path.join(process.cwd(), 'uploads', 'comments');
    const thumbnailsDir = path.join(process.cwd(), 'uploads', 'thumbnails');

    // Delete all video versions and their thumbnails
    for (const version of project.versions) {
        try {
            const videoFiles = await readdir(videosDir);
            const videoFilename = videoFiles.find(file => file.startsWith(version.videoId));
            if (videoFilename) {
                await unlink(path.join(videosDir, videoFilename));
            }
        } catch (e) {
             console.error(`Could not delete video for videoId ${version.videoId}`, e);
        }

        if (version.thumbnailFilename) {
            try {
                await unlink(path.join(thumbnailsDir, version.thumbnailFilename));
            } catch(e) {
                console.error(`Could not delete thumbnail for videoId ${version.videoId}`, e);
            }
        }
    }

    // Delete the single comments file for the project
    const commentPath = path.join(commentsDir, `${slug}.json`);
    try {
        await unlink(commentPath);
    } catch (e) {
        if (e instanceof Error && 'code' in e && e.code !== 'ENOENT') {
            console.error(`Could not delete comments for project ${slug}`, e);
        }
    }

    // Finally, delete metadata file
    await unlink(metadataPath);
}
