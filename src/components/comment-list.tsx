'use client';

import type { Comment } from '@/lib/types';
import CommentItem from '@/components/comment-item';

export default function CommentList({ comments, slug, onCommentUpdated }: { comments: Comment[], slug: string, onCommentUpdated: (comment: Comment) => void }) {
    if (comments.length === 0) {
        return <div className="text-center text-muted-foreground py-10">No feedback yet. Be the first to comment!</div>
    }

  return (
    <div className="space-y-4">
      {comments.sort((a,b) => a.timestamp - b.timestamp).map((comment) => (
        <CommentItem key={comment.id} comment={comment} slug={slug} onCommentUpdated={onCommentUpdated} />
      ))}
    </div>
  );
}
