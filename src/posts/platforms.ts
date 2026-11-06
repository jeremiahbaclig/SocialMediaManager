import type { PlatformDrafts, PlatformKey } from "./postTypes";

export const platforms: {
  id: PlatformKey;
  name: string;
  characterLimit: number;
  publishingUrl: string;
}[] = [
  {
    id: "youtube",
    name: "YouTube",
    characterLimit: 100,
    publishingUrl: "https://studio.youtube.com/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    characterLimit: 2200,
    publishingUrl: "https://www.tiktok.com/tiktokstudio/upload",
  },
  {
    id: "instagram",
    name: "Instagram",
    characterLimit: 2200,
    publishingUrl: "https://www.instagram.com/",
  },
  {
    id: "twitter",
    name: "X",
    characterLimit: 280,
    publishingUrl: "https://x.com/compose/post",
  },
];

export function copyOriginalToPlatform(
  platform: "youtube",
  originalContent: string,
): PlatformDrafts["youtube"];
export function copyOriginalToPlatform(
  platform: "tiktok" | "instagram" | "twitter",
  originalContent: string,
): PlatformDrafts["tiktok"];
export function copyOriginalToPlatform(
  platform: PlatformKey,
  originalContent: string,
): PlatformDrafts[PlatformKey];
export function copyOriginalToPlatform(
  platform: PlatformKey,
  originalContent: string,
): PlatformDrafts[PlatformKey] {
  switch (platform) {
    case "youtube":
      return {
        enabled: true,
        title: originalContent,
        description: originalContent,
        status: "not_started",
      };
    case "tiktok":
    case "instagram":
    case "twitter":
      return {
        enabled: true,
        caption: originalContent,
        status: "not_started",
      };
  }
}

export function resetPlatformContent(
  platform: "youtube",
  originalContent: string,
): PlatformDrafts["youtube"];
export function resetPlatformContent(
  platform: "tiktok" | "instagram" | "twitter",
  originalContent: string,
): PlatformDrafts["tiktok"];
export function resetPlatformContent(
  platform: PlatformKey,
  originalContent: string,
): PlatformDrafts[PlatformKey];
export function resetPlatformContent(
  platform: PlatformKey,
  originalContent: string,
): PlatformDrafts[PlatformKey] {
  return copyOriginalToPlatform(platform, originalContent);
}
