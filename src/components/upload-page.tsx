'use client';

import { useState } from 'react';
import Link from 'next/link';
import VideoUploadForm from '@/components/video-upload-form';
import ShareLink from '@/components/share-link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import type { UploadResult } from '@/lib/types';

export default function UploadPage() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  return (
    <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in-50" style={{'--tw-shadow-color': 'hsl(var(--accent))', '--tw-shadow-opacity': '0.1'}}>
      <CardHeader className="text-center relative">
         <div className="absolute top-4 right-4">
            <Button asChild variant="outline">
                <Link href="/list">My Videos</Link>
            </Button>
        </div>
        <CardTitle className="text-4xl font-headline bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent pb-2">VideoReview</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Upload a video to get a shareable feedback link. No login required.</CardDescription>
      </CardHeader>
      <CardContent>
        {uploadResult ? (
          <ShareLink slug={uploadResult.slug} />
        ) : (
          <VideoUploadForm onUploadSuccess={setUploadResult} />
        )}
      </CardContent>
    </Card>
  );
}
