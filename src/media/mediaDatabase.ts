import type { MediaItem } from "./mediaTypes";
import type { PostDraft } from "../posts/postTypes";

const databaseName = "social-publisher";
const databaseVersion = 2;
const mediaStoreName = "media";
const postsStoreName = "posts";

let databasePromise: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;

  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(mediaStoreName)) {
        database.createObjectStore(mediaStoreName, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(postsStoreName)) {
        database.createObjectStore(postsStoreName, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        databasePromise = undefined;
      };
      resolve(database);
    };

    request.onerror = () => {
      reject(
        new Error(
          `Could not open browser media storage: ${request.error?.message ?? "unknown database error"}`,
        ),
      );
    };

    request.onblocked = () => {
      reject(
        new Error(
          "Media storage is blocked by another open tab. Close other app tabs and try again.",
        ),
      );
    };
  }).catch((error: unknown) => {
    databasePromise = undefined;
    throw error;
  });

  databasePromise = opening;
  return opening;
}

function getErrorMessage(error: DOMException | null): string {
  if (error?.name === "QuotaExceededError") {
    return "Browser storage is full. Delete some media or free up browser storage, then try again.";
  }
  return error?.message ?? "unknown database error";
}

export async function getAllMedia(): Promise<MediaItem[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readonly");
    const request = transaction.objectStore(mediaStoreName).getAll();
    request.onsuccess = () => {
      const items = request.result as MediaItem[];
      resolve(items.sort((a, b) => b.createdAt - a.createdAt));
    };
    request.onerror = () => {
      reject(
        new Error(`Could not load media: ${getErrorMessage(request.error)}`),
      );
    };
  });
}

export async function saveMedia(item: MediaItem): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readwrite");
    transaction.objectStore(mediaStoreName).put(item);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(
        new Error(
          `Could not save ${item.name}: ${getErrorMessage(transaction.error)}`,
        ),
      );
    };
    transaction.onabort = () => {
      reject(
        new Error(
          `Could not save ${item.name}: ${getErrorMessage(transaction.error)}`,
        ),
      );
    };
  });
}

export async function deleteMediaFromStorage(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(mediaStoreName, "readwrite");
    transaction.objectStore(mediaStoreName).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(
        new Error(
          `Could not delete media: ${getErrorMessage(transaction.error)}`,
        ),
      );
    };
    transaction.onabort = () => {
      reject(
        new Error(
          `Could not delete media: ${getErrorMessage(transaction.error)}`,
        ),
      );
    };
  });
}

export async function getPostById(id: string): Promise<PostDraft | undefined> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(postsStoreName, "readonly")
      .objectStore(postsStoreName)
      .get(id);
    request.onsuccess = () => resolve(request.result as PostDraft | undefined);
    request.onerror = () => {
      reject(new Error(`Could not load post: ${getErrorMessage(request.error)}`));
    };
  });
}

export async function getAllPosts(): Promise<PostDraft[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(postsStoreName, "readonly")
      .objectStore(postsStoreName)
      .getAll();
    request.onsuccess = () => resolve(request.result as PostDraft[]);
    request.onerror = () => {
      reject(new Error(`Could not load posts: ${getErrorMessage(request.error)}`));
    };
  });
}

export async function savePost(post: PostDraft): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(postsStoreName, "readwrite");
    transaction.objectStore(postsStoreName).put(post);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(
        new Error(`Could not save post: ${getErrorMessage(transaction.error)}`),
      );
    };
    transaction.onabort = () => {
      reject(
        new Error(`Could not save post: ${getErrorMessage(transaction.error)}`),
      );
    };
  });
}

export async function deletePost(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(postsStoreName, "readwrite");
    transaction.objectStore(postsStoreName).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(
        new Error(`Could not delete post: ${getErrorMessage(transaction.error)}`),
      );
    };
    transaction.onabort = () => {
      reject(
        new Error(`Could not delete post: ${getErrorMessage(transaction.error)}`),
      );
    };
  });
}

export async function getMediaPostReferences(
  mediaId: string,
): Promise<number> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.mediaIds.includes(mediaId)).length;
}
