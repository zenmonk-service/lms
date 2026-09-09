import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { LeaveRequestStatus, Row } from "@/features/leave/leave.types";
import { LeaveSummary } from "../leave-summary";
import { ManagementDecision } from "../management-decision";
import { RequestActions } from "../request-actions";
import { RequestTrigger } from "../request-trigger";

interface IProps {
  leaveRequest: Row;
  canUpdate: boolean;
  isView?: boolean;
  onEdit?: (leaveRequest: Row) => void;
  onDelete?: (uuid: string) => void;
}

export function RequestAccordionItem({
  leaveRequest,
  canUpdate,
  isView,
  onEdit,
  onDelete,
}: IProps) {
  const canShowActions =
    leaveRequest.status === LeaveRequestStatus.PENDING && !isView && canUpdate;

  return (
    <AccordionItem value={leaveRequest.uuid} className="last:border-b-0">
      <AccordionTrigger className="hover:no-underline hover:bg-accent/40 px-4 gap-2">
        <RequestTrigger leaveRequest={leaveRequest} />
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-4 px-4 pb-4">
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ManagementDecision managers={leaveRequest.managers} />

          <div className="flex flex-col gap-4">
            <LeaveSummary leaveRequest={leaveRequest} />
            {canShowActions && (
              <RequestActions
                leaveRequest={leaveRequest}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
