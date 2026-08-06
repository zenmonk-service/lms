import { IFile } from "@/features/leave/leave.types";
import { FILE_TYPE_LABELS } from "@/utils/file-types-label";
import { Dot } from "lucide-react";

interface IProps {
  document: IFile;
}

export function AttachmentsCard({ document }: IProps) {
  return (
    <div className="p-4 bg-card border mt-4 rounded-sm">
      <div className="flex items-center gap-2">
        <div className="flex flex-col min-w-0">
          <a
            href={document.file_url}
            target="_blank"
            rel="noreferrer"
            className="truncate font-medium text-sm hover:underline"
          >
            {document.file_name}
          </a>
          {document.meta_data && (
            <div className="flex items-center">
              <p className="text-xs text-background-foreground">
                {document.meta_data.size >= 1024 * 1024
                  ? `${(document.meta_data.size / (1024 * 1024)).toFixed(2)} MB`
                  : `${(document.meta_data.size / 1024).toFixed(2)} KB`}
              </p>
              <Dot className="text-background-foreground" />
              <p className="text-xs text-background-foreground">
                {FILE_TYPE_LABELS[document.meta_data.type] || document.meta_data.type}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
