import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { MediaCard } from "../components/MediaCard";
import { MediaPreviewDialog } from "../components/MediaPreviewDialog";
import { MediaUploadPanel } from "../components/MediaUploadPanel";
import { PageHeading } from "../components/PageHeading";
import { useMediaLibrary } from "../media/MediaProvider";
import type { MediaItem } from "../media/mediaTypes";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is MediaItem => item !== undefined),
    [items, selectedIds],
  );
  const previewItem = items.find((item) => item.id === previewId) ?? null;

  function reorder(draggedId: string, targetId: string) {
    setSelectedIds((ids) => {
      const from = ids.indexOf(draggedId);
      const to = ids.indexOf(targetId);
      return from === -1 || to === -1 ? ids : moveItem(ids, from, to);
    });
  }

  return (
    <>
      <PageHeading title="Create Post" />
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Add media
          </h2>
          <MediaUploadPanel />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Selected media
            </h2>
            <span className="text-sm text-slate-500">
              {selectedItems.length} selected
            </span>
          </div>
          {selectedItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {selectedItems.map((item, index) => (
                <SelectedMediaCard
                  key={item.id}
                  item={item}
                  index={index}
                  count={selectedItems.length}
                  onPreview={() => setPreviewId(item.id)}
                  onRemove={() =>
                    setSelectedIds((ids) => ids.filter((id) => id !== item.id))
                  }
                  onMove={(direction) =>
                    setSelectedIds((ids) =>
                      moveItem(ids, index, index + direction),
                    )
                  }
                  onDropReorder={reorder}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
              Select media from your library below.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Media library
          </h2>
          {loadError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onSelect={() =>
                    setSelectedIds((ids) =>
                      ids.includes(item.id)
                        ? ids.filter((id) => id !== item.id)
                        : [...ids, item.id],
                    )
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
      </div>
      <MediaPreviewDialog
        item={previewItem}
        onClose={() => setPreviewId(null)}
      />
    </>
  );
}
