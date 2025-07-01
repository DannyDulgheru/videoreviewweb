import { notFound, redirect } from 'next/navigation';
import { readFile } from 'fs/promises';
import path from 'path';
import ReviewPage from '@/components/review-page';
import type { VideoProject, VideoVersion } from '@/lib/types';
import type { Metadata } from 'next';

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

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const slug = params.slug[0];
  const versionParam = params.slug[1];
  const project = await getProject(slug);

  if (!project || project.versions.length === 0) {
    return {
      title: 'Project Not Found',
    };
  }
  
  const getBaseUrl = () => {
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    // Use NEXT_PUBLIC_ for client-side, but this is server-side.
    // Fallback to localhost if not on Vercel.
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  };
  const baseUrl = getBaseUrl();

  const latestVersion = project.versions[0];
  let selectedVersion: VideoVersion | undefined;

  if (versionParam) {
    const versionNumber = parseInt(versionParam, 10);
    selectedVersion = project.versions.find(v => v.version === versionNumber);
  }
  
  if (!selectedVersion) {
    selectedVersion = latestVersion;
  }
  
  const getMimeType = (filename: string) => {
    const extension = path.extname(filename).toLowerCase();
    switch (extension) {
      case '.mp4': return 'video/mp4';
      case '.webm': return 'video/webm';
      case '.ogv': return 'video/ogg';
      case '.mov': return 'video/quicktime';
      default: return 'video/mp4';
    }
  }
  const mimeType = getMimeType(selectedVersion.originalName);
  const videoUrl = `${baseUrl}/api/videos/${selectedVersion.videoId}`;
  const pageUrl = `${baseUrl}/v/${project.slug}/${selectedVersion.version}`;
  const title = project.originalName;
  const description = `Review Version ${selectedVersion.version} of ${project.originalName}. Leave timestamped feedback easily.`;
  const imageUrl = selectedVersion.thumbnailFilename ? `${baseUrl}/api/thumbnails/${selectedVersion.thumbnailFilename}` : undefined;


  return {
    title: `${title} - V${selectedVersion.version}`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: pageUrl,
      type: 'video.other',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ] : [],
      videos: [
        {
          url: videoUrl,
          secureUrl: videoUrl,
          type: mimeType,
          width: 1280,
          height: 720,
        },
      ],
    },
    twitter: {
      card: 'player',
      title: title,
      description: description,
      player: videoUrl,
      playerWidth: 1280,
      playerHeight: 720,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
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
