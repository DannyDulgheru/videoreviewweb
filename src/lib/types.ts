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
