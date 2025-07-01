export type Comment = {
  id: string;
  text: string;
  timestamp: number;
  author: string;
};

export type UploadResult = {
  videoId: string;
  slug: string;
};

export type VideoVersion = {
    version: number;
    videoId: string;
    uploadedAt: string;
    originalName: string;
};

export type VideoProject = {
    slug: string;
    originalName: string; // Keep the original name of the first uploaded video
    versions: VideoVersion[];
};
