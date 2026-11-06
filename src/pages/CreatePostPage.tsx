import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { MediaCard } from "../components/MediaCard";
import { MediaPreviewDialog } from "../components/MediaPreviewDialog";
import { MediaUploadPanel } from "../components/MediaUploadPanel";
import { PageHeading } from "../components/PageHeading";
import { PublishingCard } from "../components/PublishingCard";
import { useMediaLibrary } from "../media/MediaProvider";
import type { MediaItem } from "../media/mediaTypes";
import { getAllPosts, savePost } from "../media/mediaDatabase";
import {
  copyOriginalToPlatform,
  platforms,
  resetPlatformContent,
} from "../posts/platforms";
import {
  createEmptyPost,
  type PlatformKey,
  type PlatformStatus,
  type PostDraft,
} from "../posts/postTypes";

type SaveState = "saved" | "unsaved" | "saving" | "error";
type PostChange = (post: PostDraft) => PostDraft;

function moveItem(ids: string[], from: number, to: number): string[] {
  if (to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function SelectedMediaCard({
  item,
  index,
  count,
  onPreview,
  onRemove,
  onMove,
  onDropReorder,
}: {
  item: MediaItem;
  index: number;
  count: number;
  onPreview: () => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  onDropReorder: (draggedId: string, targetId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", item.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData("text/plain");
        if (draggedId) onDropReorder(draggedId, item.id);
      }}
      className="space-y-2"
    >
      <MediaCard
        item={item}
        selected
        onSelect={onRemove}
        onPreview={onPreview}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {index + 1} of {count}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={index === 0}
            aria-label={`Move ${item.name} earlier`}
            onClick={() => onMove(-1)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            <Icon name="arrow-up" className="size-4" />
          </button>
          <button
            type="button"
            disabled={index === count - 1}
            aria-label={`Move ${item.name} later`}
            onClick={() => onMove(1)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            <Icon name="arrow-down" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CreatePostPage() {
  const { items, isLoading, loadError, reload } = useMediaLibrary();
  const [draft, setDraft] = useState<PostDraft>(() => createEmptyPost());
  const [isReady, setIsReady] = useState(false);
  const [loadPostError, setLoadPostError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [isDirty, setIsDirty] = useState(false);
  const [revision, setRevision] = useState(0);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const draftRef = useRef(draft);
  const dirtyRef = useRef(false);
  const revisionRef = useRef(0);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const enqueueSave = useCallback((post: PostDraft, savedRevision: number) => {
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        await savePost({ ...post, updatedAt: Date.now() });
        if (revisionRef.current === savedRevision) {
          dirtyRef.current = false;
          setIsDirty(false);
          setSaveError(null);
          setSaveState("saved");
        }
      })
      .catch((error: unknown) => {
        if (revisionRef.current === savedRevision) {
          const message =
            error instanceof Error ? error.message : "Could not save your post.";
          setSaveError(message);
          setSaveState("error");
        }
      });
  }, []);

  const loadDraft = useCallback(async () => {
    setIsReady(false);
    setLoadPostError(null);
    try {
      const posts = await getAllPosts();
      const latest = posts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
      const loaded = latest
        ? {
            ...latest,
            platforms: {
              youtube: {
                ...latest.platforms.youtube,
                status: latest.platforms.youtube.status ?? "not_started",
              },
              tiktok: {
                ...latest.platforms.tiktok,
                status: latest.platforms.tiktok.status ?? "not_started",
              },
              instagram: {
                ...latest.platforms.instagram,
                status: latest.platforms.instagram.status ?? "not_started",
              },
              twitter: {
                ...latest.platforms.twitter,
                status: latest.platforms.twitter.status ?? "not_started",
              },
            },
          }
        : createEmptyPost();
      draftRef.current = loaded;
      dirtyRef.current = false;
      setDraft(loaded);
      setIsDirty(false);
      setSaveState("saved");
      setIsReady(true);
    } catch (error) {
      setLoadPostError(
        error instanceof Error ? error.message : "Could not load your draft.",
      );
    }
  }, []);

  useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

  const updateDraft = useCallback((change: PostChange) => {
    const updated = {
      ...change(draftRef.current),
      updatedAt: Date.now(),
    };
    draftRef.current = updated;
    dirtyRef.current = true;
    revisionRef.current += 1;
    setDraft(updated);
    setIsDirty(true);
    setRevision(revisionRef.current);
    setSaveState("unsaved");
  }, []);

  useEffect(() => {
    if (!isReady || !isDirty) return;
    const timeout = window.setTimeout(() => {
      setSaveState("saving");
      enqueueSave(draft, revision);
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [draft, enqueueSave, isDirty, isReady, revision]);

  useEffect(
    () => () => {
      if (dirtyRef.current) {
        enqueueSave(draftRef.current, revisionRef.current);
      }
    },
    [enqueueSave],
  );

  const selectedIds = draft.mediaIds;
  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is MediaItem => item !== undefined),
    [items, selectedIds],
  );
  const previewItem = items.find((item) => item.id === previewId) ?? null;

  function reorder(draggedId: string, targetId: string) {
    updateDraft((post) => {
      const from = post.mediaIds.indexOf(draggedId);
      const to = post.mediaIds.indexOf(targetId);
      if (from === -1 || to === -1) return post;
      return { ...post, mediaIds: moveItem(post.mediaIds, from, to) };
    });
  }

  function togglePlatform(platform: PlatformKey, enabled: boolean) {
    updateDraft((post) => {
      if (platform === "youtube") {
        const existing = post.platforms.youtube;
        const content =
          enabled && !existing.title && !existing.description
            ? copyOriginalToPlatform(platform, post.originalContent)
            : { ...existing, enabled };
        return {
          ...post,
          platforms: { ...post.platforms, youtube: content },
        };
      }

      const existing = post.platforms[platform];
      const content =
        enabled && !existing.caption
          ? copyOriginalToPlatform(platform, post.originalContent)
          : { ...existing, enabled };
      return {
        ...post,
        platforms: { ...post.platforms, [platform]: content },
      };
    });
  }

  function updatePlatformText(
    platform: PlatformKey,
    field: "title" | "description" | "caption",
    value: string,
  ) {
    updateDraft((post) => {
      const current = post.platforms[platform];
      if (platform === "youtube" && field !== "caption") {
        return {
          ...post,
          platforms: {
            ...post.platforms,
            youtube: { ...post.platforms.youtube, [field]: value },
          },
        };
      }
      if (platform !== "youtube" && field === "caption") {
        return {
          ...post,
          platforms: {
            ...post.platforms,
            [platform]: { ...current, caption: value },
          },
        };
      }
      return post;
    });
  }

  function resetPlatform(platform: PlatformKey) {
    updateDraft((post) => ({
      ...post,
      platforms: {
        ...post.platforms,
        [platform]: resetPlatformContent(platform, post.originalContent),
      },
    }));
  }

  function updatePlatformStatus(
    platform: PlatformKey,
    status: PlatformStatus,
  ) {
    updateDraft((post) => {
      if (platform === "youtube") {
        return {
          ...post,
          platforms: {
            ...post.platforms,
            youtube: { ...post.platforms.youtube, status },
          },
        };
      }
      return {
        ...post,
        platforms: {
          ...post.platforms,
          [platform]: { ...post.platforms[platform], status },
        },
      };
    });
  }

  function startNewDraft() {
    if (dirtyRef.current) {
      enqueueSave(draftRef.current, revisionRef.current);
    }
    const next = createEmptyPost();
    draftRef.current = next;
    dirtyRef.current = true;
    revisionRef.current += 1;
    setDraft(next);
    setIsDirty(true);
    setRevision(revisionRef.current);
    setSaveState("unsaved");
  }

  const saveLabel: Record<SaveState, string> = {
    saved: "Saved",
    unsaved: "Unsaved changes",
    saving: "Saving…",
    error: "Save failed",
  };
  const enabledPlatforms = platforms.filter(
    ({ id }) => draft.platforms[id].enabled,
  );
  const publishedCount = enabledPlatforms.filter(
    ({ id }) => draft.platforms[id].status === "published",
  ).length;

  return (
    <>
      <PageHeading title="Create Post">
        <div className="flex items-center gap-3">
          <span
            role={saveState === "error" ? "alert" : "status"}
            className={`text-sm ${saveState === "error" ? "text-red-700" : "text-slate-500"}`}
            title={saveError ?? undefined}
          >
            {saveState === "error" ? saveError : saveLabel[saveState]}
          </span>
          <button
            type="button"
            onClick={startNewDraft}
            disabled={!isReady}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            New draft
          </button>
        </div>
      </PageHeading>

      {loadPostError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p>{loadPostError}</p>
          <button
            type="button"
            onClick={() => void loadDraft()}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : !isReady ? (
        <p role="status" className="py-8 text-sm text-slate-500">
          Loading draft…
        </p>
      ) : (
        <div className="space-y-8">
          <section>
            <label
              htmlFor="original-content"
              className="mb-2 block text-base font-semibold text-slate-900"
            >
              Original content
            </label>
            <p className="mb-3 text-sm text-slate-500">
              Write a starting point for your platform-specific versions.
            </p>
            <textarea
              id="original-content"
              value={draft.originalContent}
              onChange={(event) =>
                updateDraft((post) => ({
                  ...post,
                  originalContent: event.target.value,
                }))
              }
              rows={5}
              placeholder="Write your post…"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">
              Platforms
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {platforms.map((platform) => {
                const enabled = draft.platforms[platform.id].enabled;
                return (
                  <label
                    key={platform.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 transition ${
                      enabled
                        ? "border-brand-300 ring-2 ring-brand-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(event) =>
                        togglePlatform(platform.id, event.target.checked)
                      }
                      className="size-4 accent-brand-700"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      {platform.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {platforms
            .filter(({ id }) => draft.platforms[id].enabled)
            .map((platform) => {
              const content = draft.platforms[platform.id];
              const isYoutube = platform.id === "youtube";
              const caption =
                content.enabled && "caption" in content
                  ? content.caption
                  : "";
              const title =
                content.enabled && "title" in content ? content.title : "";
              const isOverLimit =
                (isYoutube ? title : caption).length > platform.characterLimit;
              return (
                <section
                  key={platform.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">
                      {platform.name}
                    </h2>
                    <button
                      type="button"
                      onClick={() => resetPlatform(platform.id)}
                      className="text-sm font-medium text-brand-700 hover:text-brand-800"
                    >
                      Reset to original
                    </button>
                  </div>
                  {isYoutube ? (
                    <>
                      <label
                        htmlFor="youtube-title"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Video title
                      </label>
                      <input
                        id="youtube-title"
                        value={title}
                        onChange={(event) =>
                          updatePlatformText(
                            "youtube",
                            "title",
                            event.target.value,
                          )
                        }
                        className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                      />
                      <label
                        htmlFor="youtube-description"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Video description
                      </label>
                      <textarea
                        id="youtube-description"
                        value={draft.platforms.youtube.description}
                        onChange={(event) =>
                          updatePlatformText(
                            "youtube",
                            "description",
                            event.target.value,
                          )
                        }
                        rows={5}
                        className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                      />
                      {!title.trim() && (
                        <p className="mt-2 text-xs text-amber-700">
                          Add a video title.
                        </p>
                      )}
                      {title.length > platform.characterLimit && (
                        <p className="mt-2 text-xs text-amber-700">
                          Title is {title.length - platform.characterLimit}{" "}
                          characters over YouTube’s {platform.characterLimit}
                          -character limit.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <label
                        htmlFor={`${platform.id}-caption`}
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        {platform.id === "twitter" ? "Post text" : "Caption"}
                      </label>
                      <textarea
                        id={`${platform.id}-caption`}
                        value={caption}
                        onChange={(event) =>
                          updatePlatformText(
                            platform.id,
                            "caption",
                            event.target.value,
                          )
                        }
                        rows={5}
                        className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                      />
                      <p className="mt-1.5 text-right text-xs text-slate-500">
                        {caption.length} / {platform.characterLimit}
                      </p>
                      {isOverLimit && (
                        <p className="text-xs text-amber-700">
                          This text exceeds the {platform.name} character
                          limit.
                        </p>
                      )}
                    </>
                  )}
                </section>
              );
            })}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Media
              </h2>
              <span className="text-sm text-slate-500">
                {selectedItems.length} selected
              </span>
            </div>
            <MediaUploadPanel />
            {selectedItems.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {selectedItems.map((item, index) => (
                  <SelectedMediaCard
                    key={item.id}
                    item={item}
                    index={index}
                    count={selectedItems.length}
                    onPreview={() => setPreviewId(item.id)}
                    onRemove={() =>
                      updateDraft((post) => ({
                        ...post,
                        mediaIds: post.mediaIds.filter((id) => id !== item.id),
                      }))
                    }
                    onMove={(direction) =>
                      updateDraft((post) => ({
                        ...post,
                        mediaIds: moveItem(
                          post.mediaIds,
                          index,
                          index + direction,
                        ),
                      }))
                    }
                    onDropReorder={reorder}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                Select media from your library below.
              </p>
            )}
            {loadError ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <p>{loadError}</p>
                <button
                  type="button"
                  onClick={() => void reload()}
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : isLoading ? (
              <p role="status" className="py-6 text-sm text-slate-500">
                Loading media…
              </p>
            ) : items.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {items.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    selected={draft.mediaIds.includes(item.id)}
                    onSelect={() =>
                      updateDraft((post) => ({
                        ...post,
                        mediaIds: post.mediaIds.includes(item.id)
                          ? post.mediaIds.filter((id) => id !== item.id)
                          : [...post.mediaIds, item.id],
                      }))
                    }
                    onPreview={() => setPreviewId(item.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="image"
                title="No media yet"
                description="Upload images or videos above to add them to your library."
              />
            )}
          </section>

          <section aria-label="Publishing">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Publishing
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Copy content, download media, and publish on each platform.
                </p>
              </div>
              {enabledPlatforms.length > 0 && (
                <div className="min-w-52">
                  <p className="mb-1.5 text-right text-sm font-medium text-slate-700">
                    {publishedCount} / {enabledPlatforms.length} platforms
                    published
                  </p>
                  <progress
                    aria-label={`${publishedCount} of ${enabledPlatforms.length} platforms published`}
                    value={publishedCount}
                    max={enabledPlatforms.length}
                    className="h-2 w-full overflow-hidden rounded-full accent-emerald-600"
                  />
                </div>
              )}
            </div>
            {enabledPlatforms.length > 0 ? (
              <div className="space-y-4">
                {enabledPlatforms.map((platform) => (
                  <PublishingCard
                    key={platform.id}
                    platform={platform}
                    post={draft}
                    media={selectedItems}
                    onStatusChange={updatePlatformStatus}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                Select a platform to prepare its publishing card.
              </p>
            )}
          </section>
        </div>
      )}
      <MediaPreviewDialog
        item={previewItem}
        onClose={() => setPreviewId(null)}
      />
    </>
  );
}
