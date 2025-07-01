'use client';

import { createContext, useContext, useRef, ReactNode, RefObject } from 'react';

type VideoContextType = {
  videoRef: RefObject<HTMLVideoElement>;
  seekTo: (time: number) => void;
};

const VideoContext = createContext<VideoContextType | null>(null);

export function VideoProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const seekTo = (time: number) => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const playWhenSeeked = () => {
        video.play();
        video.removeEventListener('seeked', playWhenSeeked);
      };
      
      // We add a one-time event listener that will play the video
      // as soon as the browser has seeked to the correct time.
      video.addEventListener('seeked', playWhenSeeked);
      video.currentTime = time;
    }
  };

  return (
    <VideoContext.Provider value={{ videoRef, seekTo }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}
