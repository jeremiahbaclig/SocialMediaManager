import { useEffect, useRef } from "react";
import { getMediaKind, type MediaItem } from "../media/mediaTypes";
import { Icon } from "./Icon";
import { useObjectUrl } from "../media/useObjectUrl";

export function MediaPreviewDialog({
  item,
  onClose,
}: {
  item: MediaItem | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const url = useObjectUrl(item?.blob);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (item) dialog?.showModal();
    return () => dialog?.close();
  }, [item]);

  if (!item) return null;

  const kind = getMediaKind(item.name, item.mimeType);

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Preview ${item.name}`}
      className="m-auto w-[min(92vw,900px)] max-w-none rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/70"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-slate-500">
            {item.mimeType || "Unknown type"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Close preview"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>
      <div className="flex max-h-[78vh] min-h-40 items-center justify-center overflow-auto bg-slate-950 p-3 sm:p-6">
        {url && kind === "image" && (
          <img
            src={url}
            alt={item.name}
            className="max-h-[70vh] max-w-full object-contain"
          />
        )}
        {url && kind === "video" && (
          <video
            src={url}
            controls
            autoPlay={false}
            className="max-h-[70vh] max-w-full"
          >
            Your browser does not support video playback.
          </video>
        )}
      </div>
    </dialog>
  );
}
