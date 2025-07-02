'use client';

import { useState, useEffect } from 'react';
import { useVideo } from '@/contexts/video-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';
import type { Comment } from '@/lib/types';

const adjectives = ["Agile", "Bright", "Clever", "Dandy", "Eager", "Fancy", "Gentle", "Happy", "Jolly", "Kind", "Lively", "Merry", "Nice", "Proud", "Silly", "Witty"];
const nouns = ["Aardvark", "Badger", "Capybara", "Dolphin", "Elephant", "Fox", "Giraffe", "Hippo", "Iguana", "Jaguar", "Koala", "Lemur", "Meerkat", "Narwhal", "Ocelot", "Penguin", "Quokka", "Rabbit", "Sloth", "Tiger", "Urial", "Vulture", "Walrus", "Xerus", "Yak", "Zebra"];

function generateRandomName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}


export default function CommentInput({ slug, version, onCommentPosted, parentId, onCancel, isReply = false }: { 
    slug: string, 
    version: number, 
    onCommentPosted: (comment: Comment) => void,
    parentId?: string,
    onCancel?: () => void,
    isReply?: boolean,
}) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState('Anonymous');
  const { videoRef } = useVideo();
  const { toast } = useToast();

  useEffect(() => {
    try {
      let user = localStorage.getItem('videoReviewUser');
      if (user) {
        setAuthorName(user);
      } else {
        const newName = generateRandomName();
        setAuthorName(newName);
        localStorage.setItem('videoReviewUser', newName);
      }
    } catch (e) {
      console.error("Could not access local storage", e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !videoRef.current) return;

    setIsSubmitting(true);
    const timestamp = parentId ? 0 : videoRef.current.currentTime; // Replies don't need a new timestamp

    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, timestamp, author: authorName, version, parentId }),
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
         handleSubmit(e as any);
      }
    }
    if (e.key === 'Escape' && onCancel) {
        e.preventDefault();
        onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-start space-x-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isReply ? "Write a reply... (Shift+Enter for new line)" : "Add your feedback... (Shift+Enter for new line)"}
            className="flex-1 resize-none"
            rows={isReply ? 2 : 3}
            disabled={isSubmitting}
            autoFocus={isReply}
          />
         {!isReply && (
            <Button type="submit" size="icon" disabled={isSubmitting || !text.trim()} aria-label="Post comment">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
         )}
      </div>
      {isReply && (
        <div className="flex justify-end space-x-2">
            {onCancel && <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
             <Button type="submit" size="sm" disabled={isSubmitting || !text.trim()} aria-label="Post reply">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reply'}
            </Button>
        </div>
      )}
    </form>
  );
}
