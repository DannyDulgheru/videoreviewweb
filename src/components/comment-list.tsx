'use client';

import type { Comment } from '@/lib/types';
import CommentItem from '@/components/comment-item';
import { useMemo } from 'react';

type CommentWithReplies = Comment & { replies: CommentWithReplies[] };

const nestComments = (commentList: Comment[]): CommentWithReplies[] => {
    const commentMap = new Map<string, CommentWithReplies>();
    commentList.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });

    const nestedComments: CommentWithReplies[] = [];
    commentList.forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id)!;
        if (comment.parentId && commentMap.has(comment.parentId)) {
            const parent = commentMap.get(comment.parentId)!;
            parent.replies.push(commentWithReplies);
        } else {
            nestedComments.push(commentWithReplies);
        }
    });

    const sortByTimestamp = (a: Comment, b: Comment) => a.timestamp - b.timestamp;
    
    nestedComments.sort(sortByTimestamp);
    for (const comment of commentMap.values()) {
        comment.replies.sort(sortByTimestamp);
    }
    
    return nestedComments;
};

const CommentThread = ({
    comment,
    slug,
    onCommentPosted,
    onCommentUpdated,
    hoveredCommentId,
    setHoveredCommentId,
    activeCommentId
}: {
    comment: CommentWithReplies;
    slug: string;
    onCommentPosted: (comment: Comment) => void;
    onCommentUpdated: (comment: Comment) => void;
    hoveredCommentId: string | null;
    setHoveredCommentId: (id: string | null) => void;
    activeCommentId: string | null;
}) => {
    return (
        <div className="flex flex-col">
            <CommentItem 
                comment={comment} 
                slug={slug} 
                onCommentPosted={onCommentPosted}
                onCommentUpdated={onCommentUpdated}
                hoveredCommentId={hoveredCommentId}
                setHoveredCommentId={setHoveredCommentId}
                activeCommentId={activeCommentId}
            />
            {comment.replies.length > 0 && (
                <div className="ml-5 pl-4 border-l-2 border-muted/20 space-y-2 mt-2">
                    {comment.replies.map(reply => (
                        <CommentThread 
                            key={reply.id} 
                            comment={reply}
                            slug={slug}
                            onCommentPosted={onCommentPosted}
                            onCommentUpdated={onCommentUpdated}
                            hoveredCommentId={hoveredCommentId}
                            setHoveredCommentId={setHoveredCommentId}
                            activeCommentId={activeCommentId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


export default function CommentList({ 
    comments, 
    slug, 
    onCommentPosted,
    onCommentUpdated,
    hoveredCommentId,
    setHoveredCommentId,
    activeCommentId,
}: { 
    comments: Comment[], 
    slug: string, 
    onCommentPosted: (comment: Comment) => void,
    onCommentUpdated: (comment: Comment) => void,
    hoveredCommentId: string | null,
    setHoveredCommentId: (id: string | null) => void,
    activeCommentId: string | null,
}) {
    const nestedComments = useMemo(() => nestComments(comments), [comments]);
    
    if (comments.length === 0) {
        return <div className="text-center text-muted-foreground py-10">No feedback yet. Be the first to comment!</div>
    }

    return (
        <div className="space-y-4">
            {nestedComments.map((comment) => (
                <CommentThread 
                    key={comment.id}
                    comment={comment}
                    slug={slug}
                    onCommentPosted={onCommentPosted}
                    onCommentUpdated={onCommentUpdated}
                    hoveredCommentId={hoveredCommentId}
                    setHoveredCommentId={setHoveredCommentId}
                    activeCommentId={activeCommentId}
                />
            ))}
        </div>
    );
}
