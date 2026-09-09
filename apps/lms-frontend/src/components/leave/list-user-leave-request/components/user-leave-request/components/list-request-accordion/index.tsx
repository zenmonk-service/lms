import { Accordion } from "@/components/ui/accordion";
import { setLeaveRequestFilter } from "@/features/leave/leave.slice";
import { LeaveRequest } from "@/features/leave/leave.types";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { useAppDispatch } from "@/store/hooks";
import InfiniteScroll from "react-infinite-scroll-component";
import { AccordionLoader } from "./components/accordion-loader";
import { RequestAccordionItem } from "./components/request-accordion-item";

interface IProps {
  userLeaveRequests: LeaveRequest;
  isLoadingMore?: boolean;
  onEdit?: (leaveRequest: LeaveRequest["rows"][number]) => void;
  onDelete?: (uuid: string) => void;
  isView?: boolean;
}

const ListRequestAccordion = ({
  userLeaveRequests,
  isLoadingMore,
  onEdit,
  onDelete,
  isView,
}: IProps) => {
  const dispatch = useAppDispatch();
  const can = usePermissionCheck();

  const canUpdate = can(
    PermissionTag.LEAVE_REQUEST_MANAGEMENT,
    PermissionAction.UPDATE,
  );

  return (
    <Accordion
      id="scrollable-accordion"
      type="single"
      collapsible
      className="w-full bg-card rounded-md max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-327px)] overflow-auto border border-border"
      defaultValue={`${userLeaveRequests.rows[0]?.uuid}`}
    >
      <InfiniteScroll
        dataLength={userLeaveRequests.rows.length}
        next={() =>
          dispatch(
            setLeaveRequestFilter({
              pagination: {
                page: userLeaveRequests.current_page + 1,
                limit: 10,
              },
            }),
          )
        }
        hasMore={(userLeaveRequests.total || 0) > userLeaveRequests.rows.length}
        loader={isLoadingMore ? <AccordionLoader /> : null}
        scrollableTarget="scrollable-accordion"
      >
        {userLeaveRequests.rows.map((leaveRequest) => (
          <RequestAccordionItem
            key={leaveRequest.uuid}
            leaveRequest={leaveRequest}
            canUpdate={canUpdate}
            isView={isView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </InfiniteScroll>
    </Accordion>
  );
};

export default ListRequestAccordion;
