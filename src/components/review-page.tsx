'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/video-player';
import CommentsSection from '@/components/comments-section';
import { Separator } from '@/components/ui/separator';
import { VideoProvider } from '@/contexts/video-context';
import type { VideoProject, VideoVersion } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReviewPage({ project }: { project: VideoProject }) {
  // Default to the latest version (which is the first in the sorted array)
  const [selectedVersion, setSelectedVersion] = useState<VideoVersion>(project.versions[0]);
  
  // This effect ensures that when the project data changes (e.g. new version added),
  // we are still showing the latest version.
  useEffect(() => {
      setSelectedVersion(project.versions[0]);
  }, [project]);
  
  const handleVersionChange = (videoId: string) => {
      const version = project.versions.find(v => v.videoId === videoId);
      if (version) {
          setSelectedVersion(version);
      }
  };

  return (
    <VideoProvider>
      <div className="flex flex-col w-full h-full max-w-screen-2xl mx-auto space-y-4">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center px-2 gap-4">
            <h1 className="text-2xl font-headline text-foreground">{project.originalName}</h1>
            {project.versions.length > 1 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Select Version:</span>
                    <Select onValueChange={handleVersionChange} defaultValue={selectedVersion.videoId}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent>
                            {project.versions.map(v => (
                                <SelectItem key={v.videoId} value={v.videoId}>
                                    Version {v.version} - {new Date(v.uploadedAt).toLocaleDateString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </header>
        <div className="flex flex-col md:flex-row w-full flex-grow bg-card rounded-xl shadow-lg overflow-hidden animate-in fade-in-50 min-h-0">
          <div className="relative w-full md:w-[65%] h-full flex items-center justify-center bg-black">
            <VideoPlayer videoId={selectedVersion.videoId} />
          </div>
          <div className="hidden md:flex items-center justify-center w-[2%]">
            <Separator orientation="vertical" className="h-full" />
          </div>
          <div className="w-full md:w-[33%] h-full flex flex-col min-h-0">
            <CommentsSection slug={project.slug} />
          </div>
        </div>
      </div>
    </VideoProvider>
  );
}
