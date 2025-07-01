'use client';

import { useState } from 'react';
import { useVideo } from '@/contexts/video-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';
import type { Comment } from '@/lib/types';

export default function CommentInput({ slug, onCommentPosted }: { slug: string, onCommentPosted: (comment: Comment) => void }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { videoRef } = useVideo();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !videoRef.current) return;

    setIsSubmitting(true);
    const timestamp = videoRef.current.currentTime;

    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, timestamp }),
      });

      if (response.ok) {
        const newComment = await response.json();
        onCommentPosted(newComment);
        setText('');
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to post comment.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !isSubmitting) {
        e.currentTarget.form?.requestSubmit();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add your feedback... (Shift+Enter for new line)"
        className="flex-1 resize-none"
        rows={2}
        disabled={isSubmitting}
      />
      <Button type="submit" size="icon" disabled={isSubmitting || !text.trim()} aria-label="Post comment">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
}
