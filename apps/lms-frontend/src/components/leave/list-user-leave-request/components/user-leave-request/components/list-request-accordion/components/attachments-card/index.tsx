import { IFile } from "@/features/leave/leave.types";
import { FILE_TYPE_LABELS } from "@/utils/file-types-label";
import { Dot, Paperclip } from "lucide-react";
import { formatFileSize } from "../../utils";

export function AttachmentsCard({ documents }: { documents: IFile[] }) {
  return (
    <div className="bg-muted rounded-xl border border-border p-4 sm:col-span-2 space-y-3">
      <div className="flex items-center gap-2">
        <Paperclip size={14} />
        <p className="font-semibold text-sm">Attachments</p>
        <span className="text-[10px] text-muted-foreground">
          ({documents.length})
        </span>
      </div>
      <div className="space-y-2">
        {documents.map((doc) => (
          <a
            key={doc.uuid}
            href={doc.file_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/40 transition-colors"
          >
            <div className="bg-muted p-2 rounded-md shrink-0">
              <Paperclip className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate font-medium text-sm">
                {doc.file_name}
              </span>
              {doc.meta_data && (
                <span className="flex items-center text-xs text-muted-foreground">
                  {formatFileSize(doc.meta_data.size)}
                  <Dot />
                  {FILE_TYPE_LABELS[doc.meta_data.type] || doc.meta_data.type}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
