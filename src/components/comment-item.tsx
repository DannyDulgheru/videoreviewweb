'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useVideo } from '@/contexts/video-context';
import type { Comment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function CommentItem({ comment, slug }: { comment: Comment, slug: string }) {
  const { seekTo } = useVideo();
  const { toast } = useToast();
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!slug) return;
    try {
      const doneComments = JSON.parse(localStorage.getItem(`done-comments-${slug}`) || '[]');
      setIsDone(doneComments.includes(comment.id));
    } catch (e) {
      console.error("Could not read from local storage", e);
    }
  }, [comment.id, slug]);
  
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

  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-start space-x-3 p-2 rounded-lg transition-opacity ${isDone ? 'opacity-40' : 'opacity-100'}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0" onClick={toggleDone} aria-label={isDone ? 'Mark as not done' : 'Mark as done'}>
            {isDone ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-muted-foreground" />}
        </Button>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <button onClick={() => seekTo(comment.timestamp)} className="text-sm font-semibold text-accent hover:underline">
            {formatTimestamp(comment.timestamp)}
          </button>
          <p className="text-sm font-bold text-foreground">{comment.author}</p>
        </div>
        <p className="text-foreground/90">{comment.text}</p>
      </div>
    </div>
  );
}
