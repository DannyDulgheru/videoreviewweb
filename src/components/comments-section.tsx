'use client';

import type { Comment, VideoVersion } from '@/lib/types';
import CommentList from '@/components/comment-list';
import CommentInput from '@/components/comment-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from 'react';

export default function CommentsSection({ 
    slug, 
    currentVersion,
    comments,
    isLoading,
    onCommentPosted,
    onCommentUpdated,
    hoveredCommentId,
    setHoveredCommentId,
    activeCommentId,
    versions,
}: { 
    slug: string, 
    currentVersion: number,
    comments: Comment[],
    isLoading: boolean,
    onCommentPosted: (comment: Comment) => void,
    onCommentUpdated: (comment: Comment) => void,
    hoveredCommentId: string | null,
    setHoveredCommentId: (id: string | null) => void,
    activeCommentId: string | null,
    versions: VideoVersion[],
}) {
  const [filterVersion, setFilterVersion] = useState('all');

  const filteredComments = useMemo(() => {
    if (filterVersion === 'all') {
      return comments;
    }
    const versionNumber = parseInt(filterVersion, 10);
    return comments.filter(comment => comment.version === versionNumber);
  }, [comments, filterVersion]);
  
  const sortedVersions = useMemo(() => [...versions].sort((a,b) => a.version - b.version), [versions]);

  return (
    <div className="flex flex-col h-full bg-card-foreground/5">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-headline">Feedback</h2>
            
            {sortedVersions.length > 1 && (
                <Tabs value={filterVersion} onValueChange={setFilterVersion}>
                    <TabsList className="h-9">
                        <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                        {sortedVersions.map(v => (
                            <TabsTrigger key={v.version} value={String(v.version)} className="text-xs px-3">
                                V{v.version}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}
        </div>
      </div>
      <ScrollArea className="flex-grow p-4">
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : <CommentList 
                comments={filteredComments} 
                slug={slug} 
                onCommentPosted={onCommentPosted}
                onCommentUpdated={onCommentUpdated}
                hoveredCommentId={hoveredCommentId}
                setHoveredCommentId={setHoveredCommentId}
                activeCommentId={activeCommentId}
            />}
      </ScrollArea>
      <div className="p-4 border-t border-border bg-card flex-shrink-0">
        <CommentInput slug={slug} version={currentVersion} onCommentPosted={onCommentPosted} />
      </div>
    </div>
  );
}
