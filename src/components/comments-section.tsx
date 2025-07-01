'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '@/lib/types';
import CommentList from '@/components/comment-list';
import CommentInput from '@/components/comment-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentPosted = (newComment: Comment) => {
    setComments(prev => [...prev, newComment]);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
  };
  
  return (
    <div className="flex flex-col h-full bg-card-foreground/5">
      <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-bold font-headline">Feedback</h2>
      </div>
      <ScrollArea className="flex-grow p-4">
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : <CommentList comments={comments} slug={slug} onCommentUpdated={handleCommentUpdated} />}
      </ScrollArea>
      <div className="p-4 border-t border-border bg-card flex-shrink-0">
        <CommentInput slug={slug} onCommentPosted={handleCommentPosted} />
      </div>
    </div>
  );
}
