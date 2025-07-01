'use client';

import { useState } from 'react';
import VideoUploadForm from '@/components/video-upload-form';
import ShareLink from '@/components/share-link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UploadPage() {
  const [uploadResult, setUploadResult] = useState<{ videoId: string; } | null>(null);

  return (
    <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in-50" style={{'--tw-shadow-color': 'hsl(var(--accent))', '--tw-shadow-opacity': '0.1'}}>
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-headline bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent pb-2">VideoReview</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Upload a video to get a shareable feedback link. No login required.</CardDescription>
      </CardHeader>
      <CardContent>
        {uploadResult ? (
          <ShareLink videoId={uploadResult.videoId} />
        ) : (
          <VideoUploadForm onUploadSuccess={setUploadResult} />
        )}
      </CardContent>
    </Card>
  );
}
