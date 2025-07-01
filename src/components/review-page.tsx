'use client';

import VideoPlayer from '@/components/video-player';
import CommentsSection from '@/components/comments-section';
import { Separator } from '@/components/ui/separator';
import { VideoProvider } from '@/contexts/video-context';

export default function ReviewPage({ videoId }: { videoId: string }) {
  return (
    <VideoProvider>
      <div className="flex flex-col md:flex-row w-full h-[calc(100vh-8rem)] max-w-screen-2xl mx-auto bg-card rounded-xl shadow-lg overflow-hidden animate-in fade-in-50">
        <div className="relative w-full md:w-[65%] h-full flex items-center justify-center bg-black">
          <VideoPlayer videoId={videoId} />
        </div>
        <div className="hidden md:flex items-center justify-center w-[2%]">
          <Separator orientation="vertical" className="h-full" />
        </div>
        <div className="w-full md:w-[33%] h-full flex flex-col">
          <CommentsSection videoId={videoId} />
        </div>
      </div>
    </VideoProvider>
  );
}
