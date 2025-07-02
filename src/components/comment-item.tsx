'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, MessageSquarePlus } from 'lucide-react';
import { useVideo } from '@/contexts/video-context';
import type { Comment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import CommentInput from './comment-input';


export default function CommentItem({ 
    comment, 
    slug, 
    onCommentPosted,
    onCommentUpdated,
    hoveredCommentId,
    setHoveredCommentId,
    activeCommentId,
}: { 
    comment: Comment, 
    slug: string, 
    onCommentPosted: (comment: Comment) => void,
    onCommentUpdated: (comment: Comment) => void,
    hoveredCommentId: string | null,
    setHoveredCommentId: (id: string | null) => void,
    activeCommentId: string | null,
}) {
  const { seekTo } = useVideo();
  const { toast } = useToast();
  const [isDone, setIsDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isHighlighted = comment.id === hoveredCommentId || comment.id === activeCommentId;
  const isReply = !!comment.parentId;

  useEffect(() => {
    if (!slug || isReply) return; // Don't track 'done' status for replies
    try {
      const doneComments = JSON.parse(localStorage.getItem(`done-comments-${slug}`) || '[]');
      setIsDone(doneComments.includes(comment.id));
    } catch (e) {
      console.error("Could not read from local storage", e);
    }
  }, [comment.id, slug, isReply]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
    }
  }, [isEditing]);
  
  const toggleDone = () => {
    if (!slug || isReply) return;
    try {
      const doneComments: string[] = JSON.parse(localStorage.getItem(`done-comments-${slug}`) || '[]');
      const newIsDone = !isDone;

      let newDoneComments: string[];
      if (newIsDone) {
        newDoneComments = [...doneComments, comment.id];
        toast({ title: 'Marked as done!' });
      } else {
        newDoneComments = doneComments.filter(id => id !== comment.id);
      }
      
      localStorage.setItem(`done-comments-${slug}`, JSON.stringify(newDoneComments));
      setIsDone(newIsDone);
    } catch (e) {
      console.error("Could not write to local storage", e);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.text);
  };

  const handleSaveEdit = async () => {
    if (editText.trim() === '' || editText.trim() === comment.text) {
        setIsEditing(false);
        setEditText(comment.text);
        return;
    }
    
    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: comment.id, text: editText.trim() }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        onCommentUpdated(updatedComment);
        setIsEditing(false);
        toast({ title: 'Comment updated!' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update comment.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred.' });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  }

  const handleReplyPosted = (newComment: Comment) => {
    onCommentPosted(newComment);
    setIsReplying(false);
  }

  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  // Render replies (subcomments) differently
  if (isReply) {
    return (
       <div className={cn('p-2 rounded-lg transition-all duration-200', isHighlighted && 'bg-accent/20')}>
           {isEditing ? (
              <div className="space-y-2">
                <Textarea 
                  ref={textareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="resize-none"
                  rows={Math.max(2, editText.split('\n').length)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                </div>
              </div>
           ) : (
              <div className="flex items-start space-x-3">
                  <div className="flex-1">
                      <p className="text-foreground/90 whitespace-pre-wrap text-sm" onDoubleClick={handleDoubleClick}>
                          <span className="font-bold text-foreground mr-2">{comment.author}:</span>
                          {comment.text}
                      </p>
                  </div>
              </div>
           )}
       </div>
    );
  }

  // Render top-level comments
  return (
    <div className="relative">
        <div 
            className={cn(
                'flex items-start space-x-3 p-2 rounded-lg transition-all duration-200 group', 
                isDone ? 'opacity-40' : 'opacity-100',
                isHighlighted && 'bg-accent/20'
            )}
            onMouseEnter={() => { setHoveredCommentId(comment.id); setIsHovered(true); }}
            onMouseLeave={() => { setHoveredCommentId(null); setIsHovered(false); }}
        >
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0" onClick={toggleDone} aria-label={isDone ? 'Mark as not done' : 'Mark as done'}>
                {isDone ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
            </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <Button variant="link" onClick={() => seekTo(comment.timestamp)} className="text-sm font-semibold text-accent hover:underline p-0 h-auto">
                {formatTimestamp(comment.timestamp)}
              </Button>
              <p className="text-sm font-bold text-foreground">{comment.author}</p>
            </div>
            {isEditing ? (
              <div className="mt-1 space-y-2">
                <Textarea 
                  ref={textareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="resize-none"
                  rows={Math.max(2, editText.split('\n').length)}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground/90 whitespace-pre-wrap mt-1" onDoubleClick={handleDoubleClick}>
                {comment.text}
              </p>
            )}
          </div>
            <div className={cn("absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity", isHovered ? 'opacity-100' : 'opacity-0')}>
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsReplying(true)}>
                     <MessageSquarePlus className="h-4 w-4 text-muted-foreground"/>
                 </Button>
            </div>
        </div>

        {isReplying && (
            <div className="mt-2 ml-10 pl-2">
                <CommentInput 
                    slug={slug}
                    version={comment.version}
                    onCommentPosted={handleReplyPosted}
                    parentId={comment.id}
                    onCancel={() => setIsReplying(false)}
                    isReply={true}
                />
            </div>
        )}
    </div>
  );
}
