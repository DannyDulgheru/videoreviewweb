'use client';

import type { Comment } from '@/lib/types';
import CommentList from '@/components/comment-list';
import CommentInput from '@/components/comment-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommentsSection({ 
    slug, 
    currentVersion,
    comments,
    isLoading,
    onCommentPosted,
    onCommentUpdated,
    hoveredCommentId,
    setHoveredCommentId,
}: { 
    slug: string, 
    currentVersion: number,
    comments: Comment[],
    isLoading: boolean,
    onCommentPosted: (comment: Comment) => void,
    onCommentUpdated: (comment: Comment) => void,
    hoveredCommentId: string | null,
    setHoveredCommentId: (id: string | null) => void,
}) {
  
  return (
    <div className="flex flex-col h-full bg-card-foreground/5">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h2 className="text-xl font-bold font-headline">Feedback</h2>
      </div>
      <ScrollArea className="flex-grow p-4">
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : <CommentList comments={comments} slug={slug} onCommentUpdated={onCommentUpdated} hoveredCommentId={hoveredCommentId} setHoveredCommentId={setHoveredCommentId} />}
      </ScrollArea>
      <div className="p-4 border-t border-border bg-card flex-shrink-0">
        <CommentInput slug={slug} version={currentVersion} onCommentPosted={onCommentPosted} />
      </div>
    </div>
  );
}
