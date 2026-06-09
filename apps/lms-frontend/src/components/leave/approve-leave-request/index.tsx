import Title from "@/shared/typography/title";
import LeaveRequestFilters from "./components/filter-panel";
import LeaveRequests from "./components/leave-requests";
import UserLeaveRequestDetails from "./components/leave-requests/components/user-leave-request-details";

const ApproveLeaveRequest = () => {
  return (
    <div className="p-6 h-full">
      <Title
        title={{
          text: "Leave Request Management",
          className: "",
        }}
        description={{
          text: "Review and process employee leave requests with comprehensive approval workflows",
          className: "",
        }}
        className=""
      />

      <div className="flex h-[calc(100vh-177px)] bg-card rounded-lg border border-border overflow-scroll">
        <div className="w-80 border-r border-border">
          <LeaveRequestFilters />
        </div>
        <div className="w-96 border-r border-border">
          <LeaveRequests />
        </div>
        <div className="flex-1">
          <UserLeaveRequestDetails />
        </div>
      </div>
    </div>
  );
};

export default ApproveLeaveRequest;
