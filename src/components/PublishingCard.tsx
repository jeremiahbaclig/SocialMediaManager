import { useState } from "react";
import type { MediaItem } from "../media/mediaTypes";
import { getMediaKind } from "../media/mediaTypes";
import { useObjectUrl } from "../media/useObjectUrl";
import type {
  PlatformKey,
  PlatformStatus,
  PostDraft,
} from "../posts/postTypes";
import { Icon } from "./Icon";

type PublishingCardProps = {
  platform: {
    id: PlatformKey;
    name: string;
    publishingUrl: string;
  };
  post: PostDraft;
  media: MediaItem[];
  onStatusChange: (platform: PlatformKey, status: PlatformStatus) => void;
};

const statusLabels: Record<PlatformStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  published: "Published",
};

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard access is unavailable.");
}

function MediaDownload({ item }: { item: MediaItem }) {
  const url = useObjectUrl(item.blob);
  return (
    <a
      href={url ?? undefined}
      download={item.name}
      aria-disabled={!url}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 ${!url ? "pointer-events-none opacity-50" : ""}`}
    >
      <Icon name="download" className="size-4" />
      {item.name}
    </a>
  );
}

export function PublishingCard({
  platform,
  post,
  media,
  onStatusChange,
}: PublishingCardProps) {
  const status = post.platforms[platform.id].status;
  const [copyMessage, setCopyMessage] = useState("");
  const captionText =
    platform.id === "tiktok"
      ? post.platforms.tiktok.caption
      : platform.id === "instagram"
        ? post.platforms.instagram.caption
        : platform.id === "twitter"
          ? post.platforms.twitter.caption
          : "";
  const platformMedia =
    platform.id === "youtube"
      ? media.filter(
          (item) => getMediaKind(item.name, item.mimeType) === "video",
        )
      : media;

  async function handleCopy(label: string, value: string) {
    try {
      await copyText(value);
      setCopyMessage(`${label} copied.`);
    } catch (error) {
      setCopyMessage(
        error instanceof Error ? error.message : "Could not copy text.",
      );
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
            {platform.name === "YouTube" ? "▶" : platform.name[0]}
          </span>
          <h3 className="text-base font-semibold text-slate-900">
            {platform.name}
          </h3>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              status === "published"
                ? "bg-emerald-50 text-emerald-700"
                : status === "in_progress"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {statusLabels[status]}
          </span>
        </div>
        <a
          href={platform.publishingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-800"
        >
          Open {platform.name}
          <Icon name="arrow-up-right" className="size-4" />
        </a>
      </div>

      <div className="mt-5 space-y-4">
        {platform.id === "youtube" ? (
          <>
            <CopyableContent
              label="Title"
              value={post.platforms.youtube.title}
              onCopy={() =>
                void handleCopy("Title", post.platforms.youtube.title)
              }
            />
            <CopyableContent
              label="Description"
              value={post.platforms.youtube.description}
              onCopy={() =>
                void handleCopy(
                  "Description",
                  post.platforms.youtube.description,
                )
              }
            />
          </>
        ) : (
          <CopyableContent
            label={platform.id === "twitter" ? "Post text" : "Caption"}
            value={captionText}
            onCopy={() =>
              void handleCopy(
                platform.id === "twitter" ? "Post text" : "Caption",
                captionText,
              )
            }
          />
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            {platform.id === "youtube" ? "Videos" : "Media"}
          </p>
          {platformMedia.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {platformMedia.map((item) => (
                <MediaDownload key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {platform.id === "youtube"
                ? "No video selected."
                : "No media selected."}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <span className="mr-1 text-sm font-medium text-slate-700">
          Publishing status
        </span>
        {status !== "in_progress" && status !== "published" && (
          <button
            type="button"
            onClick={() => onStatusChange(platform.id, "in_progress")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Mark in progress
          </button>
        )}
        {status !== "published" && (
          <button
            type="button"
            onClick={() => onStatusChange(platform.id, "published")}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Mark as published
          </button>
        )}
        {status !== "not_started" && (
          <button
            type="button"
            onClick={() => onStatusChange(platform.id, "not_started")}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            Reset status
          </button>
        )}
        {copyMessage && (
          <span
            role="status"
            className="ml-auto w-full text-sm text-slate-500 sm:w-auto"
          >
            {copyMessage}
          </span>
        )}
      </div>
    </article>
  );
}

function CopyableContent({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Icon name="copy" className="size-3.5" />
          Copy
        </button>
      </div>
      <p className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-700">
        {value || "No content"}
      </p>
    </div>
  );
}
