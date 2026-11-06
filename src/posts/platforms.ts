import type { PlatformDrafts, PlatformKey } from "./postTypes";

export const platforms: {
  id: PlatformKey;
  name: string;
  characterLimit: number;
}[] = [
  { id: "youtube", name: "YouTube", characterLimit: 100 },
  { id: "tiktok", name: "TikTok", characterLimit: 2200 },
  { id: "instagram", name: "Instagram", characterLimit: 2200 },
  { id: "twitter", name: "X", characterLimit: 280 },
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
      };
    case "tiktok":
    case "instagram":
    case "twitter":
      return { enabled: true, caption: originalContent };
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
