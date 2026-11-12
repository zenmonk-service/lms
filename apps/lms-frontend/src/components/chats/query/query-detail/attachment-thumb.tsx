import { X } from "lucide-react";

/** Image preview above the composer, with an optional remove button. */
export function AttachmentThumb({
  src,
  alt,
  caption,
  onRemove,
}: {
  src: string;
  alt: string;
  caption?: string;
  /** Omitted while a send/edit is in progress, which hides the remove button. */
  onRemove?: () => void;
}) {
  return (
    <div className="mb-2">
      <div className="relative inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-32 max-w-full rounded-xl object-cover ring-1 ring-border"
        />
        {onRemove && (
          <button
            type="button"
            aria-label="Remove image"
            onClick={onRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform hover:scale-105"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {caption && (
        <p className="mt-1 text-[11px] text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}
