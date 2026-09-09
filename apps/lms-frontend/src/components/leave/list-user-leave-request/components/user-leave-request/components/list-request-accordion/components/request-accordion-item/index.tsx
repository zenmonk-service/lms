import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { LeaveRequestStatus, Row } from "@/features/leave/leave.types";
import { LeaveDetails } from "../leave-details";
import { LeaveFacts } from "../leave-facts";
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
      <AccordionTrigger className="hover:no-underline hover:bg-accent/40 data-[state=open]:bg-accent/40 px-4 gap-2">
        <RequestTrigger leaveRequest={leaveRequest} />
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-3 px-4 pb-4">
        <Separator />

        <LeaveFacts leaveRequest={leaveRequest} />
        <ManagementDecision managers={leaveRequest.managers} />
        <LeaveDetails leaveRequest={leaveRequest} />

        {canShowActions && (
          <RequestActions
            leaveRequest={leaveRequest}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
