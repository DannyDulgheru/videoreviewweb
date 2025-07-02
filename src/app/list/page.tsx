import VideoListPage from '@/components/video-list-page';
import AuthGuard from '@/components/auth-guard';

export default function List() {
  return (
    <AuthGuard>
        <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-background">
            <VideoListPage />
        </main>
    </AuthGuard>
  );
}
