'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

export default function ShareLink({ videoId }: { videoId: string }) {
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?v=${videoId}`;
      setShareUrl(url);
    }
  }, [videoId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "The video link has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="text-center space-y-4 p-4 border border-dashed rounded-lg animate-in fade-in-50">
        <h3 className="text-xl font-semibold font-headline">Upload Complete!</h3>
        <p className="text-muted-foreground">Share this link with your reviewers:</p>
      <div className="flex w-full items-center space-x-2">
        <Input type="text" value={shareUrl} readOnly className="bg-muted text-foreground" aria-label="Shareable video link" />
        <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy link">
          {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
