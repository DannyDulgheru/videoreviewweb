import UploadPage from '@/components/upload-page';
import AuthGuard from '@/components/auth-guard';

export default function Home() {
  return (
    <AuthGuard>
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
            <UploadPage />
        </main>
    </AuthGuard>
  );
}
