import { Row } from "@/features/leave/leave.types";
import { FileText } from "lucide-react";
import { AttachmentsCard } from "../attachments-card";
import { SummaryCard } from "../summary-card";

export function LeaveDetails({ leaveRequest }: { leaveRequest: Row }) {
  const hasReason = Boolean(leaveRequest.reason);
  const hasDocuments = Boolean(leaveRequest.documents?.length);

  if (!hasReason && !hasDocuments) return null;

  return (
    <div className="space-y-3">
      {hasReason && (
        <SummaryCard icon={FileText} label="Reason">
          <p className="text-sm font-semibold wrap-break-word">
            {leaveRequest.reason}
          </p>
        </SummaryCard>
      )}

      {hasDocuments && <AttachmentsCard documents={leaveRequest.documents} />}
    </div>
  );
}
