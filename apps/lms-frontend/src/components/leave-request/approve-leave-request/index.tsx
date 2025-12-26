import React from "react";
import LeaveRequestFilters from "./filter-panel";
import LeaveRequests from "./leave-requests";
import UserLeaveRequest from "./leave-requests/user-leave-request";

const ApproveLeaveRequest = () => {
  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Leave Request Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and process employee leave requests with comprehensive approval
          workflows
        </p>
      </div>

      <div className="flex max-h-[calc(100vh-177px)] bg-[#f9fafb] rounded-lg border border-border overflow-hidden">
        <div className="w-80 border-r border-border">
          <LeaveRequestFilters />
        </div>
        <div className="w-96 border-r border-border">
          <LeaveRequests />
        </div>
        <div className="flex-1">
          <UserLeaveRequest />
        </div>
      </div>
    </div>
  );
};

export default ApproveLeaveRequest;
