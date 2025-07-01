import ReviewPage from '@/components/review-page';

export default function VideoReviewPage({ params }: { params: { videoId: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
      <ReviewPage videoId={params.videoId} />
    </main>
  );
}
