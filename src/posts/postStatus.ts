import type { PostDraft, PlatformKey } from "./postTypes";

export type PostStatus = "draft" | "partially_published" | "fully_published";

export function getPostStatus(post: PostDraft): PostStatus {
  const enabledPlatforms = (
    Object.keys(post.platforms) as PlatformKey[]
  ).filter((platform) => post.platforms[platform].enabled);

  if (
    enabledPlatforms.length === 0 ||
    enabledPlatforms.every(
      (platform) =>
        (post.platforms[platform].status ?? "not_started") === "not_started",
    )
  ) {
    return "draft";
  }

  if (
    enabledPlatforms.every(
      (platform) => post.platforms[platform].status === "published",
    )
  ) {
    return "fully_published";
  }

  return "partially_published";
}

export const postStatusLabels: Record<PostStatus, string> = {
  draft: "Draft",
  partially_published: "Partially published",
  fully_published: "Fully published",
};
