'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import UploadPage from '@/components/upload-page';
import ReviewPage from '@/components/review-page';

function HomePageContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
      {videoId ? <ReviewPage videoId={videoId} /> : <UploadPage />}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
