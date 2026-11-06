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
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  uploadFiles: (files: File[]) => Promise<UploadResult>;
  deleteMedia: (id: string) => Promise<void>;
};

const MediaLibraryContext = createContext<MediaLibraryValue | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const uploadFiles = useCallback(async (files: File[]) => {
    const added: MediaItem[] = [];
    const errors: string[] = [];

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
  }, []);

  const deleteMedia = useCallback(async (id: string) => {
    const references = await getMediaPostReferences(id);
    if (references > 0) {
      throw new Error(
        `This media is used by ${references} saved ${references === 1 ? "post" : "posts"}. Remove it from those posts before deleting it.`,
      );
    }
    await deleteMediaFromStorage(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ items, isLoading, loadError, reload, uploadFiles, deleteMedia }),
    [items, isLoading, loadError, reload, uploadFiles, deleteMedia],
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
