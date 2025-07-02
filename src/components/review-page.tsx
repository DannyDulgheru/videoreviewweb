'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/video-player';
import CommentsSection from '@/components/comments-section';
import { VideoProvider } from '@/contexts/video-context';
import type { VideoProject, VideoVersion, Comment } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function ReviewPage({ project, initialVersion }: { project: VideoProject, initialVersion: VideoVersion }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedVersion, setSelectedVersion] = useState<VideoVersion>(initialVersion);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project.originalName);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  
  useEffect(() => {
    setSelectedVersion(initialVersion);
    setProjectTitle(project.originalName);
  }, [initialVersion, project.originalName]);
  
  const fetchComments = useCallback(async () => {
    if (!project.slug) return;
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/comments/${project.slug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [project.slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);


  const handleVersionChange = (versionNumber: string) => {
      router.push(`/v/${project.slug}/${versionNumber}`);
  };
  
  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectTitle(e.target.value);
  };
  
  const saveTitle = async () => {
    if (projectTitle.trim() === '' || projectTitle === project.originalName) {
        setProjectTitle(project.originalName); // Reset if empty or unchanged
        setIsEditingTitle(false);
        return;
    }

    try {
        const response = await fetch(`/api/projects/${project.slug}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalName: projectTitle }),
        });
        if (response.ok) {
            toast({ title: "Title updated successfully!" });
            // You might want to update the project data here if needed elsewhere
        } else {
             toast({ variant: "destructive", title: "Error", description: "Failed to update title." });
             setProjectTitle(project.originalName);
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "An error occurred." });
        setProjectTitle(project.originalName);
    } finally {
        setIsEditingTitle(false);
    }
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        saveTitle();
    }
    if (e.key === 'Escape') {
        setProjectTitle(project.originalName);
        setIsEditingTitle(false);
    }
  };
  
  const handleCommentPosted = (newComment: Comment) => {
    setComments(prev => [...prev, newComment].sort((a,b) => a.timestamp - b.timestamp));
  };
  
  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
  };

  const handleTimeUpdate = (time: number) => {
    const sortedComments = comments.filter(c => c.version === selectedVersion.version).sort((a, b) => a.timestamp - b.timestamp);
    let currentComment = null;
    for (const comment of sortedComments) {
      if (time >= comment.timestamp - 0.5) {
        currentComment = comment.id;
      } else {
        break;
      }
    }
    setActiveCommentId(currentComment);
  };

  return (
    <VideoProvider>
      <div className="flex flex-col w-full h-full max-w-screen-2xl mx-auto space-y-4">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center px-2 gap-4">
            {isEditingTitle ? (
                 <Input
                    type="text"
                    value={projectTitle}
                    onChange={handleTitleChange}
                    onBlur={saveTitle}
                    onKeyDown={handleTitleKeyDown}
                    className="text-2xl font-headline h-auto"
                    autoFocus
                 />
            ) : (
                <h1 className="text-2xl font-headline text-foreground" onDoubleClick={handleTitleDoubleClick} title="Double-click to edit title">
                    {projectTitle}
                </h1>
            )}
            
            <div className="flex items-center gap-2">
                {project.versions.length > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground shrink-0">Version:</span>
                        <Select onValueChange={handleVersionChange} defaultValue={String(selectedVersion.version)}>
                            <SelectTrigger className="w-full sm:w-[220px]">
                                <SelectValue placeholder="Select version" />
                            </SelectTrigger>
                            <SelectContent>
                                {project.versions.map(v => (
                                    <SelectItem key={v.videoId} value={String(v.version)}>
                                        Version {v.version} - {new Date(v.uploadedAt).toLocaleDateString()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a href={`/api/videos/${selectedVersion.videoId}`} download={selectedVersion.originalName}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download Video</span>
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download V{selectedVersion.version}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
        </header>
        <div className="flex flex-col md:flex-row w-full flex-grow bg-card rounded-xl shadow-lg overflow-hidden animate-in fade-in-50 min-h-0">
          <div className="relative w-full md:w-3/5 h-full flex items-center justify-center bg-black">
            <VideoPlayer 
                videoId={selectedVersion.videoId} 
                comments={comments.filter(c => c.version === selectedVersion.version)} 
                hoveredCommentId={hoveredCommentId} 
                setHoveredCommentId={setHoveredCommentId}
                onTimeUpdate={handleTimeUpdate}
            />
          </div>
          <div className="w-full md:w-2/5 h-full flex flex-col min-h-0">
            <CommentsSection 
                slug={project.slug} 
                currentVersion={selectedVersion.version}
                comments={comments}
                isLoading={isLoadingComments}
                onCommentPosted={handleCommentPosted}
                onCommentUpdated={handleCommentUpdated}
                hoveredCommentId={hoveredCommentId}
                setHoveredCommentId={setHoveredCommentId}
                activeCommentId={activeCommentId}
            />
          </div>
        </div>
      </div>
    </VideoProvider>
  );
}
