import ReviewPage from '@/components/review-page';

// This page will handle URLs like /v/abcdef12/my-cool-video
// The slug parameter will be an array: ['abcdef12', 'my-cool-video']
export default function VideoReviewPage({ params }: { params: { slug: string[] } }) {
  const videoId = params.slug[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
      <ReviewPage videoId={videoId} />
    </main>
  );
}
