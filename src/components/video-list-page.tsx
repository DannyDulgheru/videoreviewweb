'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UploadCloud, Loader2, PlusCircle } from 'lucide-react';
import type { VideoProject } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function VideoListPage() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch video projects.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fetching projects.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [toast]);
  
  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/projects/${slug}`, { method: 'DELETE' });
      if (response.ok) {
        setProjects(projects.filter(p => p.slug !== slug));
        toast({ title: 'Success', description: 'Project deleted successfully.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete project.' });
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during deletion.' });
    }
  };
  
  const handleNewVersionClick = (slug: string) => {
    setUploadingSlug(slug);
    fileInputRef.current?.click();
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && uploadingSlug) {
      handleUpload(e.target.files[0], uploadingSlug);
    }
    if(fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
    setUploadingSlug(null);
  };

  const handleUpload = async (file: File, slug: string) => {
    setUploadingSlug(slug);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', slug);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({ title: 'Upload Complete', description: `New version added for ${slug}.` });
        fetchProjects(); // Refresh the list to show the new version
      } else {
        const err = await response.json();
        toast({ variant: 'destructive', title: 'Upload Failed', description: err.error || 'Could not upload new version.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during upload.' });
    } finally {
      setUploadingSlug(null);
    }
  };

  const getExpirationDate = (isoDate: string) => {
    const date = new Date(isoDate);
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString();
  }

  if (isLoading) {
    return <Loader2 className="h-10 w-10 animate-spin text-primary" />;
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
       <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
       <div className="flex justify-between items-center">
        <h1 className="text-4xl font-headline">My Video Projects</h1>
        <Button asChild>
          <Link href="/"><PlusCircle /> New Project</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center p-8">
            <CardTitle>No videos yet!</CardTitle>
            <CardDescription className="mt-2">Upload your first video to get started.</CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
        {projects.map(project => (
            <Card key={project.slug} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
              <div className="flex-grow">
                 <Link href={`/v/${project.slug}/${project.versions[0].version}`} className="hover:underline">
                    <h2 className="text-xl font-semibold text-primary">{project.originalName}</h2>
                 </Link>
                 <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:gap-4">
                    <span>{project.versions.length} version(s) - Last updated: {new Date(project.versions[0].uploadedAt).toLocaleDateString()}</span>
                    <span>Expires on: {getExpirationDate(project.createdAt)}</span>
                 </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleNewVersionClick(project.slug)} disabled={!!uploadingSlug}>
                      {uploadingSlug === project.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud />}
                      <span className="ml-2 hidden sm:inline">New Version</span>
                  </Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm"><Trash2 /><span className="ml-2 hidden sm:inline">Delete</span></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the entire project and all its versions and feedback.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project.slug)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </div>
            </Card>
        ))}
        </div>
      )}
    </div>
  );
}
