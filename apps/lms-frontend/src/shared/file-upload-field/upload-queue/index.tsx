import { Button } from "@/components/ui/button";
import {
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  useFileUpload,
} from "@/components/ui/file-upload";
import { FileText, X } from "lucide-react";

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function UploadQueue() {
  const entries = useFileUpload((state) => Array.from(state.files.values()));

  const failed = entries.filter((f) => f.status === "error");
  const uploading = entries.filter((f) => f.status === "idle" || f.status === "uploading");

  return (
    <>
      {uploading.map((f) => (
        <FileUploadItem
          key={fileKey(f.file)}
          value={f.file}
          className="bg-muted/40 rounded-lg p-3"
        >
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-2 min-w-0">
                {f.file.type.startsWith("image/") ? (
                  <FileUploadItemPreview className="size-8 rounded object-cover shrink-0 border-0 bg-transparent p-0" />
                ) : (
                  <FileText className="size-8" />
                )}

                <div className="min-w-0 flex flex-col flex-1">
                  <p className="truncate font-medium text-sm">{f.file.name}</p>

                  <p className="text-muted-foreground text-xs">
                    {f.file.size >= 1024 * 1024
                      ? `${(f.file.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(f.file.size / 1024).toFixed(2)} KB`}
                  </p>
                </div>
              </div>

              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7 shrink-0">
                  <X className="size-4" />
                </Button>
              </FileUploadItemDelete>
            </div>

            <div className="space-y-2">
              <div className="flex justify-end text-muted-foreground text-xs">
                {f.progress}%
              </div>

              <FileUploadItemProgress />
            </div>
          </div>
        </FileUploadItem>
      ))}

      {failed.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 border-t pt-3 text-muted-foreground text-xs font-medium">
            Failed
          </div>
          {failed.map((f) => (
            <FileUploadItem
              key={fileKey(f.file)}
              value={f.file}
              className="border-destructive/30 bg-destructive/5"
            >
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X className="size-4" />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </div>
      )}
    </>
  );
}
