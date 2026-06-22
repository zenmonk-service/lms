import DataTable from "@/shared/table";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect } from "react";
import { useLeaveRequestsColumns } from "./column-def";
import { listUserLeaveRequestsAction } from "@/features/leave/list-user-leave-requests/list-user-leave-requests.action";

const LeaveRequestTable = () => {
  const dispatch = useAppDispatch();

  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);
  const { userLeaveRequestsLoading, userLeaveRequests } = useAppSelector((state) => state.leaveSlice);
  
  const columns = useLeaveRequestsColumns();

  useEffect(() => {
    dispatch(listUserLeaveRequestsAction({ org_uuid: currentOrganization.uuid, user_uuid: currentUser.user_id }));
  }, [dispatch, currentOrganization.uuid, currentUser.user_id]);

  return (
    <DataTable
      columns={columns}
      searchable={false}
      showPagination={false}
      data={userLeaveRequests.rows}
      isLoading={userLeaveRequestsLoading}
      totalCount={userLeaveRequests.rows.length}
      noDataMessage="Establish your organization's leave policies to start managing employee time off. Define accrual rules, eligibility roles, and categorization logic."
    />
  );
};

export default LeaveRequestTable;
