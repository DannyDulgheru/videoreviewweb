import VideoListPage from '@/components/video-list-page';
import SimpleAuth from '@/components/simple-auth';

export default function List() {
  return (
    <SimpleAuth>
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-background">
        <VideoListPage />
      </main>
    </SimpleAuth>
  );
}
