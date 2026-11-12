import { Download, FileText } from "lucide-react";
import { QueryAttachment } from "@/features/query/query.types";
import { cn } from "@/lib/utils";
import {
  formatFileSize,
  getAttachmentSize,
  isImageAttachment,
} from "./message-utils";

/** Image preview or file card inside a message bubble. */
export function MessageAttachment({
  attachment,
  isOwn,
  hasText,
}: {
  attachment: QueryAttachment;
  isOwn: boolean;
  hasText: boolean;
}) {
  return (
    <div className={cn("-mx-1 mt-0.5", hasText && "mb-1.5")}>
      {isImageAttachment(attachment) ? (
        <a href={attachment.file_url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.file_url}
            alt={attachment.file_name}
            className="max-h-64 max-w-full rounded-xl object-cover"
          />
        </a>
      ) : (
        <a
          href={attachment.file_url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
            isOwn
              ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
              : "bg-muted hover:bg-muted/70",
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              isOwn ? "bg-primary-foreground/15" : "bg-background",
            )}
          >
            <FileText className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">
              {attachment.file_name}
            </span>
            <span className="block text-xs opacity-70">
              {formatFileSize(getAttachmentSize(attachment))}
            </span>
          </span>
          <Download className="h-4 w-4 shrink-0 opacity-70" />
        </a>
      )}
    </div>
  );
}
