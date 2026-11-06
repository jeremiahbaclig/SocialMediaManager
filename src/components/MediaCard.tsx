import {
  formatFileSize,
  formatUploadDate,
  getMediaKind,
  type MediaItem,
} from "../media/mediaTypes";
import { useObjectUrl } from "../media/useObjectUrl";
import { Icon } from "./Icon";

type MediaCardProps = {
  item: MediaItem;
  selected?: boolean;
  onSelect?: () => void;
  onPreview: () => void;
  onDelete?: () => void;
};

export function MediaCard({
  item,
  selected = false,
  onSelect,
  onPreview,
  onDelete,
}: MediaCardProps) {
  const url = useObjectUrl(item.blob);
  const kind = getMediaKind(item.name, item.mimeType);

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white transition ${
        selected
          ? "border-brand-500 ring-2 ring-brand-100"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="group relative aspect-[4/3] bg-slate-100">
        <button
          type="button"
          onClick={onPreview}
          className="absolute inset-0 flex w-full items-center justify-center overflow-hidden"
          aria-label={`Preview ${item.name}`}
        >
          {url && kind === "image" && (
            <img
              src={url}
              alt={item.name}
              loading="lazy"
              className="size-full object-cover"
            />
          )}
          {url && kind === "video" && (
            <>
              <video
                src={url}
                muted
                preload="metadata"
                className="size-full object-cover"
              />
              <span className="absolute flex size-10 items-center justify-center rounded-full bg-slate-950/65 text-white">
                <Icon name="play" className="ml-0.5 size-5" />
              </span>
            </>
          )}
        </button>
        {onSelect && (
          <button
            type="button"
            aria-pressed={selected}
            aria-label={`${selected ? "Remove" : "Select"} ${item.name}`}
            onClick={onSelect}
            className={`absolute top-2 left-2 flex size-7 items-center justify-center rounded-lg border text-xs font-semibold shadow-sm transition ${
              selected
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-white/80 bg-white/95 text-slate-600 hover:bg-white"
            }`}
          >
            {selected ? "✓" : ""}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            aria-label={`Delete ${item.name}`}
            onClick={onDelete}
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-lg bg-white/95 text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
          >
            <Icon name="trash" className="size-4" />
          </button>
        )}
      </div>
      <div className="px-3 py-3">
        <p className="truncate text-sm font-medium text-slate-800" title={item.name}>
          {item.name}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {kind === "video" ? "Video" : "Image"} · {formatFileSize(item.size)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Added {formatUploadDate(item.createdAt)}
        </p>
      </div>
    </article>
  );
}
