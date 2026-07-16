import { ArrowDownToLine, Dot, File, Paperclip } from "lucide-react";

export function AttachmentsCard() {
  return (
    <div className="bg-background rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <Paperclip size={16} />
        <p className="font-semibold text-sm">Attachments</p>
      </div>
      <div className="p-4 bg-card border mt-4 rounded-sm">
        <div className="flex items-center gap-2">
          <File size={18} className="shrink-0" />
          <div className="flex flex-col min-w-0">
            <p className="text-xs truncate">medical_certificate.pdf</p>
            <div className="flex items-center">
              <p className="text-xs text-background-foreground">256 KB</p>
              <Dot className="text-background-foreground" />
              <p className="text-xs text-background-foreground">PDF</p>
            </div>
          </div>
          <div className="justify-end flex flex-1">
            <ArrowDownToLine size={18} className="shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}