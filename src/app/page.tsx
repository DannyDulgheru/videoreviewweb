import UploadPage from '@/components/upload-page';
import SimpleAuth from '@/components/simple-auth';

export default function Home() {
  return (
    <SimpleAuth>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
        <UploadPage />
      </main>
    </SimpleAuth>
  );
}
