'use client';

import { useEffect, useState } from 'react';
import { useVideo } from '@/contexts/video-context';
import type { Comment } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export default function VideoPlayer({ videoId, comments }: { videoId: string, comments: Comment[] }) {
  const { videoRef } = useVideo();
  const [videoSrc, setVideoSrc] = useState('');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // The API route will find the file with the correct extension
    setVideoSrc(`/api/videos/${videoId}`);
  }, [videoId]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div className="relative w-full h-full">
      {videoSrc && (
        <video
          ref={videoRef}
          controls
          className="w-full h-full object-contain"
          src={videoSrc}
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
        >
          Your browser does not support the video tag.
        </video>
      )}
      {duration > 0 && (
        <TooltipProvider>
            <div className="absolute bottom-12 md:bottom-14 left-0 right-0 h-2 px-3 pointer-events-none">
                <div className="relative w-full h-full">
                    {comments.map((comment) => (
                    <Tooltip key={comment.id}>
                        <TooltipTrigger asChild>
                            <div
                                className="absolute w-2 h-2 -translate-y-1/2 bg-accent rounded-full pointer-events-auto cursor-pointer"
                                style={{ 
                                    left: `calc(${(comment.timestamp / duration) * 100}% - 4px)`,
                                    top: '50%'
                                }}
                                onClick={() => videoRef.current && (videoRef.current.currentTime = comment.timestamp)}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{comment.text.length > 50 ? `${comment.text.slice(0, 50)}...` : comment.text}</p>
                        </TooltipContent>
                    </Tooltip>
                    ))}
                </div>
            </div>
        </TooltipProvider>
      )}
    </div>
  );
}
