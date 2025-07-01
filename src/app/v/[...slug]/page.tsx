import { notFound, redirect } from 'next/navigation';
import { readFile } from 'fs/promises';
import path from 'path';
import ReviewPage from '@/components/review-page';
import type { VideoProject, VideoVersion } from '@/lib/types';

async function getProject(slug: string): Promise<VideoProject | null> {
    try {
        const metadataDir = path.join(process.cwd(), 'uploads', 'metadata');
        const filePath = path.join(metadataDir, `${slug}.json`);
        const fileContent = await readFile(filePath, 'utf-8');
        const project: VideoProject = JSON.parse(fileContent);
        // Sort versions descending so the latest is always first
        project.versions.sort((a, b) => b.version - a.version);
        return project;
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return null; // This is how notFound() should be triggered
        }
        console.error("Failed to read project metadata", error);
        return null;
    }
}

// The slug parameter can be ['my-cool-video'] or ['my-cool-video', '1']
export default async function VideoReviewPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug[0];
  const versionParam = params.slug[1];
  const project = await getProject(slug);

  if (!project || project.versions.length === 0) {
    notFound();
  }

  const latestVersion = project.versions[0];
  let selectedVersion: VideoVersion;

  if (versionParam) {
    const versionNumber = parseInt(versionParam, 10);
    const foundVersion = project.versions.find(v => v.version === versionNumber);
    if(foundVersion) {
        selectedVersion = foundVersion;
    } else {
        // Invalid version, redirect to latest
        redirect(`/v/${slug}/${latestVersion.version}`);
    }
  } else {
    // No version in URL, redirect to the latest version's URL
    redirect(`/v/${slug}/${latestVersion.version}`);
  }

  return (
    <main className="h-screen w-screen p-4 sm:p-6 md:p-8 bg-background">
      <ReviewPage project={project} initialVersion={selectedVersion} />
    </main>
  );
}
