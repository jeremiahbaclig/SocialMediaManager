import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  deleteMediaFromStorage,
  getMediaPostReferences,
  getAllMedia,
  saveMedia,
} from "./mediaDatabase";
import {
  getMediaKind,
  getSupportedMimeType,
  type MediaItem,
} from "./mediaTypes";

type UploadResult = {
  added: MediaItem[];
  errors: string[];
};

type MediaLibraryValue = {
  items: MediaItem[];
  storageUsage: number | null;
  storageQuota: number | null;
  storageError: string | null;
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  uploadFiles: (files: File[]) => Promise<UploadResult>;
  deleteMedia: (id: string) => Promise<void>;
};

const MediaLibraryContext = createContext<MediaLibraryValue | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [storageUsage, setStorageUsage] = useState<number | null>(null);
  const [storageQuota, setStorageQuota] = useState<number | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshStorageEstimate = useCallback(async () => {
    if (!navigator.storage?.estimate) {
      setStorageUsage(null);
      setStorageQuota(null);
      setStorageError("This browser does not report storage usage.");
      return;
    }

    try {
      const estimate = await navigator.storage.estimate();
      setStorageUsage(estimate.usage ?? null);
      setStorageQuota(estimate.quota ?? null);
      setStorageError(null);
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `Could not check browser storage: ${error.message}`
          : "Could not check browser storage.",
      );
    }
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setItems(await getAllMedia());
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load media.",
      );
    } finally {
      setIsLoading(false);
    }
    await refreshStorageEstimate();
  }, [refreshStorageEstimate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const uploadFiles = useCallback(async (files: File[]) => {
    const added: MediaItem[] = [];
    const errors: string[] = [];
    const totalSize = files.reduce((total, file) => {
      const mimeType = getSupportedMimeType(file);
      return file.size > 0 && getMediaKind(file.name, mimeType)
        ? total + file.size
        : total;
    }, 0);

    if (totalSize > 0 && navigator.storage?.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (
          estimate.usage !== undefined &&
          estimate.quota !== undefined &&
          totalSize > estimate.quota - estimate.usage
        ) {
          return {
            added,
            errors: [
              "These files exceed the browser's estimated available storage. Free browser storage or choose fewer files, then try again.",
            ],
          };
        }
      } catch (error) {
        setStorageError(
          error instanceof Error
            ? `Could not check browser storage: ${error.message}`
            : "Could not check browser storage.",
        );
      }
    }

    for (const file of files) {
      if (file.size === 0) {
        errors.push(`${file.name}: file is empty.`);
        continue;
      }

      const mimeType = getSupportedMimeType(file);
      if (!getMediaKind(file.name, mimeType)) {
        errors.push(
          `${file.name}: unsupported format. Use JPEG, PNG, GIF, WebP, AVIF, MP4, WebM, or MOV.`,
        );
        continue;
      }

      const item: MediaItem = {
        id: crypto.randomUUID(),
        name: file.name,
        mimeType,
        size: file.size,
        blob: file,
        createdAt: Date.now(),
      };

      try {
        await saveMedia(item);
        added.push(item);
        setItems((current) =>
          [item, ...current].sort((a, b) => b.createdAt - a.createdAt),
        );
        await refreshStorageEstimate();
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error.message
            : `Could not save ${file.name}.`,
        );
        break;
      }
    }

    return { added, errors };
  }, [refreshStorageEstimate]);

  const deleteMedia = useCallback(async (id: string) => {
    const references = await getMediaPostReferences(id);
    if (references > 0) {
      throw new Error(
        `This media is used by ${references} saved ${references === 1 ? "post" : "posts"}. Remove it from those posts before deleting it.`,
      );
    }
    await deleteMediaFromStorage(id);
    setItems((current) => current.filter((item) => item.id !== id));
    await refreshStorageEstimate();
  }, [refreshStorageEstimate]);

  const value = useMemo(
    () => ({
      items,
      storageUsage,
      storageQuota,
      storageError,
      isLoading,
      loadError,
      reload,
      uploadFiles,
      deleteMedia,
    }),
    [
      items,
      storageUsage,
      storageQuota,
      storageError,
      isLoading,
      loadError,
      reload,
      uploadFiles,
      deleteMedia,
    ],
  );

  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
    </MediaLibraryContext.Provider>
  );
}

export function useMediaLibrary(): MediaLibraryValue {
  const value = useContext(MediaLibraryContext);
  if (!value) {
    throw new Error("useMediaLibrary must be used within a MediaProvider.");
  }
  return value;
}
