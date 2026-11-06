import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { PageHeading } from "../components/PageHeading";
import { PlatformIcon } from "../components/PlatformIcon";
import { useObjectUrl } from "../media/useObjectUrl";
import { deletePost, getAllPosts, savePost } from "../media/mediaDatabase";
import { useMediaLibrary } from "../media/MediaProvider";
import type { MediaItem } from "../media/mediaTypes";
import { platforms } from "../posts/platforms";
import { createEmptyPost, type PostDraft } from "../posts/postTypes";
import { getPostStatus, postStatusLabels, type PostStatus } from "../posts/postStatus";

type PostFilter = "all" | PostStatus;

const filters: { id: PostFilter; label: string }[] = [
  { id: "all", label: "All posts" },
  { id: "draft", label: "Drafts" },
  { id: "partially_published", label: "Partially published" },
  { id: "fully_published", label: "Fully published" },
];

function MediaThumbnail({ item }: { item: MediaItem | undefined }) {
  const url = useObjectUrl(item?.blob);
  if (!item || !url) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-400">
        <Icon name="image" className="size-7" />
      </div>
    );
  }

  return item.mimeType.startsWith("video/") ? (
    <div className="relative aspect-[4/3] bg-slate-100">
      <video
        src={url}
        muted
        preload="metadata"
        className="size-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center text-white">
        <span className="rounded-full bg-slate-950/60 p-2">
          <Icon name="play" className="size-4" />
        </span>
      </span>
    </div>
  ) : (
    <img
      src={url}
      alt={item.name}
      loading="lazy"
      className="aspect-[4/3] w-full bg-slate-100 object-cover"
    />
  );
}

function PostCard({
  post,
  media,
  onDuplicate,
  onDelete,
}: {
  post: PostDraft;
  media: MediaItem[];
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const status = getPostStatus(post);
  const enabled = platforms.filter(({ id }) => post.platforms[id].enabled);
  const published = enabled.filter(
    ({ id }) => post.platforms[id].status === "published",
  ).length;
  const thumbnail = media.find((item) => post.mediaIds.includes(item.id));
  const title =
    post.originalContent.trim().split(/\r?\n/)[0]?.trim() || "Untitled post";
  const editHref = `/?post=${encodeURIComponent(post.id)}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Link to={editHref} className="block">
        <MediaThumbnail item={thumbnail} />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={editHref}
            className="line-clamp-2 min-w-0 text-sm font-semibold text-slate-900 hover:text-brand-700"
          >
            {title}
          </Link>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
              status === "fully_published"
                ? "bg-emerald-50 text-emerald-700"
                : status === "partially_published"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {postStatusLabels[status]}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
          {post.originalContent || "No caption"}
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Created{" "}
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {enabled.length > 0 ? (
            enabled.map((platform) => (
              <span
                key={platform.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
              >
                <PlatformIcon
                  platform={platform.id}
                  className="size-3.5 shrink-0"
                />
                {platform.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No platforms selected</span>
          )}
        </div>
        {enabled.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Publishing progress</span>
              <span>
                {published} / {enabled.length}
              </span>
            </div>
            <progress
              aria-label={`${published} of ${enabled.length} platforms published`}
              value={published}
              max={enabled.length}
              className="h-1.5 w-full accent-emerald-600"
            />
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Link
            to={editHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-xs font-medium text-white hover:bg-brand-800"
          >
            {status === "partially_published" ? "Resume" : "Edit"}
          </Link>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function duplicatePost(post: PostDraft): PostDraft {
  const now = Date.now();
  return {
    ...post,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    platforms: {
      youtube: { ...post.platforms.youtube, status: "not_started" },
      tiktok: { ...post.platforms.tiktok, status: "not_started" },
      instagram: { ...post.platforms.instagram, status: "not_started" },
      twitter: { ...post.platforms.twitter, status: "not_started" },
    },
  };
}

export function MyPostsPage() {
  const navigate = useNavigate();
  const { items: media } = useMediaLibrary();
  const [posts, setPosts] = useState<PostDraft[]>([]);
  const [filter, setFilter] = useState<PostFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadPosts() {
    setIsLoading(true);
    setError(null);
    try {
      const saved = await getAllPosts();
      setPosts(saved.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load posts.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (post) => filter === "all" || getPostStatus(post) === filter,
      ),
    [filter, posts],
  );

  async function handleDuplicate(post: PostDraft) {
    const copy = duplicatePost(post);
    try {
      await savePost(copy);
      setPosts((current) =>
        [copy, ...current].sort((a, b) => b.updatedAt - a.updatedAt),
      );
      setNotice("Post duplicated.");
      navigate({ pathname: "/", search: `?post=${encodeURIComponent(copy.id)}` });
    } catch (duplicateError) {
      setError(
        duplicateError instanceof Error
          ? duplicateError.message
          : "Could not duplicate post.",
      );
    }
  }

  async function handleNewPost() {
    const post = createEmptyPost();
    try {
      await savePost(post);
      navigate({ pathname: "/", search: `?post=${encodeURIComponent(post.id)}` });
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create a post.",
      );
    }
  }

  async function handleDelete(post: PostDraft) {
    const title =
      post.originalContent.trim().split(/\r?\n/)[0]?.trim() || "Untitled post";
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setError(null);
    setNotice(null);
    try {
      await deletePost(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setNotice("Post deleted. Its media remains in your library.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete post.",
      );
    }
  }

  return (
    <>
      <PageHeading title="My Posts">
        <button
          type="button"
          onClick={() => void handleNewPost()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
        >
          <Icon name="plus" className="size-4" />
          Create post
        </button>
      </PageHeading>

      {notice && (
        <p role="status" className="mb-4 text-sm text-emerald-700">
          {notice}
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadPosts()}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div
        role="group"
        aria-label="Filter posts"
        className="mb-5 flex flex-wrap gap-2"
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              filter === item.id
                ? "bg-brand-700 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p role="status" className="py-8 text-sm text-slate-500">
          Loading posts…
        </p>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="file"
          title="No posts"
          description="Saved drafts will appear here."
        />
      ) : visiblePosts.length === 0 ? (
        <EmptyState
          icon="file"
          title="No matching posts"
          description="Try another filter."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              media={media}
              onDuplicate={() => void handleDuplicate(post)}
              onDelete={() => void handleDelete(post)}
            />
          ))}
        </div>
      )}
    </>
  );
}
