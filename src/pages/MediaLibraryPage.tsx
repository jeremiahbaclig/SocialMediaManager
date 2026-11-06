import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { MediaCard } from "../components/MediaCard";
import { MediaPreviewDialog } from "../components/MediaPreviewDialog";
import { MediaUploadPanel } from "../components/MediaUploadPanel";
import { PageHeading } from "../components/PageHeading";
import { useMediaLibrary } from "../media/MediaProvider";
import { formatFileSize, type MediaItem } from "../media/mediaTypes";

export function MediaLibraryPage() {
  const {
    items,
    isLoading,
    loadError,
    reload,
    deleteMedia,
    storageUsage,
    storageQuota,
    storageError,
  } = useMediaLibrary();
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  async function handleDelete(item: MediaItem) {
    const confirmed = window.confirm(
      `Delete "${item.name}" from your media library? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      await deleteMedia(item.id);
      setDeleteSuccess(`${item.name} deleted.`);
      setPreviewItem((current) => (current?.id === item.id ? null : current));
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : `Could not delete ${item.name}.`,
      );
    }
  }

  const totalSize = items.reduce((total, item) => total + item.size, 0);

  return (
    <>
      <PageHeading
        title="Media Library"
        description="Your uploaded images and videos are saved in this browser."
      />
      <div className="space-y-7">
        <MediaUploadPanel />

        <p className="text-xs leading-5 text-slate-500">
          Clearing this site’s browser data will delete saved media.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="font-medium text-slate-800">Browser storage</p>
          {storageUsage !== null ? (
            <p className="mt-1 text-slate-500">
              {formatFileSize(storageUsage)} used
              {storageQuota !== null
                ? ` of ${formatFileSize(storageQuota)} available`
                : ""}
              . Estimates include other site data and may change.
            </p>
          ) : (
            <p className="mt-1 text-slate-500">
              {storageError ?? "Checking browser storage…"}
            </p>
          )}
        </div>

        {loadError && (
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
        )}
        {deleteError && (
          <p role="alert" className="text-sm text-red-700">
            {deleteError}
          </p>
        )}
        {deleteSuccess && (
          <p role="status" className="text-sm text-emerald-700">
            {deleteSuccess}
          </p>
        )}

        {isLoading ? (
          <p role="status" className="py-6 text-sm text-slate-500">
            Loading media…
          </p>
        ) : !loadError && items.length === 0 ? (
          <EmptyState
            icon="image"
            title="No media yet"
            description="Uploaded images and videos will appear here."
          />
        ) : (
          !loadError && (
            <section aria-label="Saved media">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  {items.length} {items.length === 1 ? "file" : "files"}
                </h2>
                <span className="text-xs text-slate-500">
                  {formatFileSize(totalSize)} total
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onPreview={() => setPreviewItem(item)}
                    onDelete={() => void handleDelete(item)}
                  />
                ))}
              </div>
            </section>
          )
        )}
      </div>
      <MediaPreviewDialog
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </>
  );
}
