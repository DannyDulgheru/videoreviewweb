import ReviewPage from '@/components/review-page';

// The slug parameter is caught by the optional catch-all route file structure,
// but it's not used in the component. It's just for making the URL more friendly.
export default function VideoReviewPage({ params }: { params: { videoId: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
      <ReviewPage videoId={params.videoId} />
    </main>
  );
}
