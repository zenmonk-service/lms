import LeaveRequest from "@/components/leave/list-user-leave-request";
import ResetLeaveRequestFilter from "@/components/leave/shared/reset-leave-request-filter";

export default function MyLeaves() {
  return (
    <ResetLeaveRequestFilter>
      <LeaveRequest />
    </ResetLeaveRequestFilter>
  );
}
