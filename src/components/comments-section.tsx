'use client';

import type { Comment } from '@/lib/types';
import CommentList from '@/components/comment-list';
import CommentInput from '@/components/comment-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2 } from 'lucide-react';

export default function CommentsSection({ 
    slug, 
    currentVersion,
    comments,
    isLoading,
    onCommentPosted,
    onCommentUpdated,
    hoveredCommentId,
    setHoveredCommentId,
    onSummarize,
    isSummarizing,
}: { 
    slug: string, 
    currentVersion: number,
    comments: Comment[],
    isLoading: boolean,
    onCommentPosted: (comment: Comment) => void,
    onCommentUpdated: (comment: Comment) => void,
    hoveredCommentId: string | null,
    setHoveredCommentId: (id: string | null) => void,
    onSummarize: () => void,
    isSummarizing: boolean,
}) {
  
  return (
    <div className="flex flex-col h-full bg-card-foreground/5">
      <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-bold font-headline">Feedback</h2>
         <Button variant="outline" size="sm" onClick={onSummarize} disabled={isSummarizing || comments.length === 0}>
            {isSummarizing ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
            <span className="ml-2 hidden sm:inline">Summarize</span>
        </Button>
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
