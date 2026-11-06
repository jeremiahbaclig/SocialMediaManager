import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Icon } from "./Icon";

type MediaUploadDropzoneProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
};

export function MediaUploadDropzone({
  onFiles,
  disabled = false,
}: MediaUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onFiles(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) onFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div
      className={`rounded-2xl border border-dashed px-5 py-8 text-center transition ${
        isDragging
          ? "border-brand-500 bg-brand-50"
          : "border-slate-300 bg-white hover:border-brand-300 hover:bg-slate-50/70"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime,video/x-m4v,.jpg,.jpeg,.png,.gif,.webp,.avif,.mp4,.webm,.mov,.m4v"
        multiple
        disabled={disabled}
        onChange={handleChange}
        aria-label="Choose images and videos to upload"
      />
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon name="upload" className="size-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800">
        Drop images or videos here
      </p>
      <p className="mt-1 text-xs text-slate-500">
        JPEG, PNG, GIF, WebP, AVIF, MP4, WebM, or MOV
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Choose files
      </button>
    </div>
  );
}
