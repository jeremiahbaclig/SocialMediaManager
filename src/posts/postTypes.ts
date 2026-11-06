export type PlatformKey = "youtube" | "tiktok" | "instagram" | "twitter";

export type PlatformStatus = "not_started" | "in_progress" | "published";

type PlatformDraft = {
  enabled: boolean;
  status: PlatformStatus;
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
      youtube: {
        enabled: false,
        title: "",
        description: "",
        status: "not_started",
      },
      tiktok: { enabled: false, caption: "", status: "not_started" },
      instagram: { enabled: false, caption: "", status: "not_started" },
      twitter: { enabled: false, caption: "", status: "not_started" },
    },
    createdAt: now,
    updatedAt: now,
  };
}
