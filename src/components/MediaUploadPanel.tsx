import { useState } from "react";
import { useMediaLibrary } from "../media/MediaProvider";
import { MediaUploadDropzone } from "./MediaUploadDropzone";

export function MediaUploadPanel() {
  const { uploadFiles, isLoading } = useMediaLibrary();
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    setIsUploading(true);
    setSuccess("");
    setErrors([]);
    try {
      const result = await uploadFiles(files);
      if (result.added.length > 0) {
        setSuccess(
          `${result.added.length} file${result.added.length === 1 ? "" : "s"} added to your library.`,
        );
      }
      setErrors(result.errors);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Could not save uploaded files.",
      ]);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section aria-label="Upload media">
      <MediaUploadDropzone
        onFiles={(files) => void handleFiles(files)}
        disabled={isLoading || isUploading}
      />
      {isUploading && (
        <p role="status" className="mt-3 text-sm text-slate-500">
          Saving files to browser storage…
        </p>
      )}
      {success && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {success}
        </p>
      )}
      {errors.length > 0 && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p className="font-medium">Some files could not be added.</p>
          <ul className="mt-1 list-inside list-disc">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
