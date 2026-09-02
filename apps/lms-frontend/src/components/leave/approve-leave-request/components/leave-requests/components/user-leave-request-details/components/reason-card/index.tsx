import { FileText } from "lucide-react";

export function ReasonCard({ reason }: { reason?: string | null }) {
  return (
    <div className="bg-background rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <FileText size={16} />
        <p className="font-semibold text-sm">Reason for Leave</p>
      </div>
      <p className="text-xs leading-relaxed mt-2 w-full max-w-full" style={{ wordBreak: "break-word" }}>
        {reason || "No reason provided."}
      </p>
    </div>
  );
}