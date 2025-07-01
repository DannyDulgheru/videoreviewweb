'use client';

import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";

export default function VideoUploadForm({ onUploadSuccess }: { onUploadSuccess: (result: { videoId: string }) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if(e.dataTransfer.files[0].type.startsWith('video/')) {
        setFile(e.dataTransfer.files[0]);
      } else {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a valid video file.",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsLoading(false);
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        onUploadSuccess({ videoId: response.videoId });
      } else {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Something went wrong. Please try again.",
        });
        setUploadProgress(0);
      }
    };
    
    xhr.onerror = () => {
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Upload Error",
            description: "An error occurred during the upload.",
        });
        setUploadProgress(0);
    };

    xhr.send(formData);
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragging ? 'border-accent bg-accent/10' : 'border-input hover:border-accent'
        }`}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="video-upload"
          aria-label="Video Upload"
        />
        <label htmlFor="video-upload" className="flex flex-col items-center justify-center text-center cursor-pointer">
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="mt-2 text-lg font-semibold">
            {isDragging ? "Drop the video here" : "Drag & drop a video or click to select"}
          </p>
          <p className="text-sm text-muted-foreground">MP4, WebM, OGG</p>
        </label>
      </div>
      {file && <p className="text-center text-sm text-foreground">Selected file: {file.name}</p>}
      
      {isLoading && <Progress value={uploadProgress} className="w-full" />}

      <Button
        onClick={handleUpload}
        disabled={!file || isLoading}
        className="w-full text-lg py-6 bg-gradient-to-br from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Uploading...</> : 'Upload Video'}
      </Button>
    </div>
  );
}
