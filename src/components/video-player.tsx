'use client';

import { useEffect, useState } from 'react';
import { useVideo } from '@/contexts/video-context';

export default function VideoPlayer({ videoId }: { videoId: string }) {
  const { videoRef } = useVideo();
  const [videoSrc, setVideoSrc] = useState('');

  useEffect(() => {
    // The API route will find the file with the correct extension
    setVideoSrc(`/api/videos/${videoId}`);
  }, [videoId]);

  return (
    <div className="w-full h-full">
      {videoSrc && (
        <video
          ref={videoRef}
          controls
          className="w-full h-full object-contain"
          src={videoSrc}
          preload="auto"
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
