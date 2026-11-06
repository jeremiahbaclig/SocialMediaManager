export type MediaKind = "image" | "video";

export interface MediaItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: number;
}

const imageTypes: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const videoTypes: Record<string, string> = {
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  mp4: "video/mp4",
  webm: "video/webm",
};

export function getMediaKind(
  name: string,
  mimeType: string,
): MediaKind | undefined {
  if (mimeType) {
    if (Object.values(imageTypes).includes(mimeType)) return "image";
    if (Object.values(videoTypes).includes(mimeType)) return "video";
    return undefined;
  }

  const extension = name.split(".").pop()?.toLowerCase();
  if (extension && imageTypes[extension]) return "image";
  if (extension && videoTypes[extension]) return "video";
  return undefined;
}

export function getSupportedMimeType(file: File): string {
  if (file.type) return file.type;

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension) return "";
  return imageTypes[extension] ?? videoTypes[extension] ?? "";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatUploadDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
