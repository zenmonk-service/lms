import ApproveLeaveRequest from "@/components/leave/approve-leave-request";
import ResetLeaveRequestFilter from "@/components/leave/shared/reset-leave-request-filter";
import React from "react";

export default function Approvals() {
  return (
    <ResetLeaveRequestFilter>
      <ApproveLeaveRequest />
    </ResetLeaveRequestFilter>
  );
}
