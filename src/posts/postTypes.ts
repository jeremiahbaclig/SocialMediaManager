export type PlatformKey = "youtube" | "tiktok" | "instagram" | "twitter";

type PlatformDraft = {
  enabled: boolean;
};

export type YoutubeDraft = PlatformDraft & {
  title: string;
  description: string;
};

export type CaptionDraft = PlatformDraft & {
  caption: string;
};

export interface PlatformDrafts {
  youtube: YoutubeDraft;
  tiktok: CaptionDraft;
  instagram: CaptionDraft;
  twitter: CaptionDraft;
}

export interface PostDraft {
  id: string;
  originalContent: string;
  mediaIds: string[];
  platforms: PlatformDrafts;
  createdAt: number;
  updatedAt: number;
}

export function createEmptyPost(id = crypto.randomUUID()): PostDraft {
  const now = Date.now();
  return {
    id,
    originalContent: "",
    mediaIds: [],
    platforms: {
      youtube: { enabled: false, title: "", description: "" },
      tiktok: { enabled: false, caption: "" },
      instagram: { enabled: false, caption: "" },
      twitter: { enabled: false, caption: "" },
    },
    createdAt: now,
    updatedAt: now,
  };
}
