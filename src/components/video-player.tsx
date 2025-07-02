'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useVideo } from '@/contexts/video-context';
import type { Comment } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function VideoPlayer({ 
    videoId, 
    comments,
    hoveredCommentId,
    setHoveredCommentId,
    onTimeUpdate,
}: { 
    videoId: string, 
    comments: Comment[],
    hoveredCommentId: string | null,
    setHoveredCommentId: (id: string | null) => void,
    onTimeUpdate: (time: number) => void,
}) {
  const { videoRef, seekTo } = useVideo();
  const playerRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  let controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsReady(false);
    setProgress(0);
    setIsPlaying(false);
    setVideoSrc(`/api/videos/${videoId}`);
  }, [videoId]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsReady(true);
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(newProgress);
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleProgressChange = (value: number[]) => {
      if(videoRef.current) {
          const newTime = (value[0] / 100) * duration;
          seekTo(newTime);
      }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
      if(videoRef.current) {
          const newVolume = value[0];
          videoRef.current.volume = newVolume;
          setVolume(newVolume);
          if (newVolume > 0 && isMuted) {
              setIsMuted(false);
          } else if (newVolume === 0) {
              setIsMuted(true);
          }
      }
  }
  
  const toggleMute = () => {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      if(videoRef.current) {
          videoRef.current.muted = newMuted;
          if(!newMuted && volume === 0) {
              setVolume(0.5);
              videoRef.current.volume = 0.5;
          }
      }
  }
  
  const toggleFullScreen = () => {
      if(playerRef.current) {
          if (!document.fullscreenElement) {
              playerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
              });
          } else {
            document.exitFullscreen();
          }
      }
  }

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
        if(isPlaying){
            setShowControls(false);
        }
    }, 3000);
  }, [isPlaying]);

  return (
    <div 
        ref={playerRef} 
        className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {if(isPlaying) setShowControls(false)}}
    >
      {!isReady && (
        <div className="absolute z-10 text-white">
            <Loader2 className="w-12 h-12 animate-spin"/>
        </div>
      )}
      {videoSrc && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={videoSrc}
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        >
          Your browser does not support the video tag.
        </video>
      )}

      <div className={cn(
          "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
          (showControls || !isPlaying) ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex flex-col gap-2">
            <div className="relative w-full h-4 group/progress">
                <Slider
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={0.1}
                    className="absolute z-10 h-1 top-1/2 -translate-y-1/2 group-hover/progress:h-2 transition-all duration-200"
                />
                {duration > 0 && (
                  <TooltipProvider>
                      <div className="absolute w-full h-full pointer-events-none z-20">
                          {comments.filter(c => !c.parentId).map((comment) => {
                              const isHovered = hoveredCommentId === comment.id;
                              return (
                                  <Tooltip key={comment.id} delayDuration={100}>
                                      <TooltipTrigger asChild>
                                          <div
                                              onMouseEnter={() => setHoveredCommentId(comment.id)}
                                              onMouseLeave={() => setHoveredCommentId(null)}
                                              className={cn(
                                                  "absolute w-2 h-2 top-1/2 -translate-y-1/2 bg-accent rounded-full pointer-events-auto cursor-pointer transition-all duration-200 group-hover/progress:w-3 group-hover/progress:h-3 ring-1 ring-white/50",
                                                  isHovered && "ring-2 ring-accent ring-offset-2 ring-offset-black w-3.5 h-3.5"
                                              )}
                                              style={{ left: `${(comment.timestamp / duration) * 100}%` }}
                                              onClick={(e) => { e.stopPropagation(); seekTo(comment.timestamp); }}
                                          />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                          <p className="max-w-xs">{comment.text}</p>
                                      </TooltipContent>
                                  </Tooltip>
                              )
                          })}
                      </div>
                  </TooltipProvider>
                )}
            </div>

            <div className="flex items-center justify-between text-white gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 hover:text-white">
                        {isPlaying ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6" />}
                    </Button>
                    <div className="flex items-center gap-2 group/volume">
                         <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 hover:text-white">
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5" />}
                        </Button>
                        <Slider 
                            value={[isMuted ? 0 : volume]}
                            onValueChange={handleVolumeChange}
                            max={1}
                            step={0.05}
                            className="w-0 group-hover/volume:w-24 transition-all duration-300"
                        />
                    </div>
                </div>
                <div className="font-mono text-sm">
                    <span>{formatTime(videoRef.current?.currentTime || 0)}</span> / <span>{formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="text-white hover:bg-white/20 hover:text-white">
                        <Maximize className="w-5 h-5"/>
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
