'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useVideo } from '@/contexts/video-context';
import type { Comment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


export default function CommentItem({ 
    comment, 
    slug, 
    onCommentUpdated,
    hoveredCommentId,
    setHoveredCommentId
}: { 
    comment: Comment, 
    slug: string, 
    onCommentUpdated: (comment: Comment) => void,
    hoveredCommentId: string | null,
    setHoveredCommentId: (id: string | null) => void
}) {
  const { seekTo } = useVideo();
  const { toast } = useToast();
  const [isDone, setIsDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isHighlighted = comment.id === hoveredCommentId;

  useEffect(() => {
    if (!slug) return;
    try {
      const doneComments = JSON.parse(localStorage.getItem(`done-comments-${slug}`) || '[]');
      setIsDone(doneComments.includes(comment.id));
    } catch (e) {
      console.error("Could not read from local storage", e);
    }
  }, [comment.id, slug]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
    }
  }, [isEditing]);
  
  const toggleDone = () => {
    if (!slug) return;
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

  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
        className={cn(
            'flex items-start space-x-3 p-2 rounded-lg transition-all duration-200', 
            isDone ? 'opacity-40' : 'opacity-100',
            isHighlighted && 'bg-accent/10'
        )}
        onMouseEnter={() => setHoveredCommentId(comment.id)}
        onMouseLeave={() => setHoveredCommentId(null)}
    >
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0" onClick={toggleDone} aria-label={isDone ? 'Mark as not done' : 'Mark as done'}>
            {isDone ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-muted-foreground" />}
        </Button>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <button onClick={() => seekTo(comment.timestamp)} className="text-sm font-semibold text-accent hover:underline">
            {formatTimestamp(comment.timestamp)}
          </button>
          <p className="text-sm font-bold text-foreground">{comment.author}</p>
          <Badge variant="outline" className="px-1.5 py-0 text-xs">V{comment.version}</Badge>
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
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                    Save
                </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground/90 whitespace-pre-wrap" onDoubleClick={handleDoubleClick}>
            {comment.text}
          </p>
        )}
      </div>
    </div>
  );
}
