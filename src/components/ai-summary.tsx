'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { summarizeComments } from '@/ai/flows/summarize-comments';
import type { Comment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AISummary({ comments }: { comments: Comment[] }) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleOpen = async () => {
    if (comments.length === 0) {
      toast({
        title: "Not enough comments",
        description: "There's no feedback to summarize yet.",
      });
      return;
    }
    
    setIsOpen(true);
    setIsLoading(true);
    setSummary('');

    try {
      const allCommentsText = comments.map(c => c.text).join('\n\n');
      const result = await summarizeComments({ comments: allCommentsText });
      setSummary(result.summary);
    } catch (error) {
      console.error("AI Summary Error:", error);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: 'Could not generate AI summary.',
      });
       setSummary("Failed to generate summary.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" onClick={handleOpen}>
          <Sparkles className="mr-2 h-4 w-4" />
          AI Summary
      </Button>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-accent" /> AI-Powered Feedback Summary
          </DialogTitle>
          <DialogDescription>
            Here's a summary of the key feedback points from the comments.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto rounded-md border p-4 my-4 bg-background">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 min-h-24">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generating summary...</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{summary}</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
