import { IFile } from "@/components/leave/leave.types";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";

export default function UploadedQueue({
  value,
  disabled,
  removeExisting,
}: {
  value: IFile[];
  disabled?: boolean;
  removeExisting: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-muted-foreground text-xs font-medium">
        Uploaded
      </div>

      <div className="flex flex-col gap-2">
        {value.map((file, index) => {
          const size = file.meta_data?.size ?? 0;

          return (
            <div
              key={`${file.file_url}-${index}`}
              className="bg-muted/40 rounded-lg p-3 border"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-2 min-w-0">
                  {file.meta_data?.type?.startsWith("image/") ? (
                    <img
                      src={file.file_url}
                      alt={file.file_name}
                      className="size-8 rounded object-cover shrink-0"
                    />
                  ) : (
                    <FileText className="size-8" />
                  )}

                  <div className="min-w-0 flex flex-col">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate font-medium text-sm hover:underline"
                    >
                      {file.file_name}
                    </a>

                    <p className="text-muted-foreground text-xs">
                      {size >= 1024 * 1024
                        ? `${(size / (1024 * 1024)).toFixed(2)} MB`
                        : `${(size / 1024).toFixed(2)} KB`}
                    </p>
                  </div>
                </div>

                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => removeExisting(index)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
