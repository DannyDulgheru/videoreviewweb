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
      videoRef.current.play();
      videoRef.current.currentTime = time;
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
