"use client";
import { getSession } from "@/app/auth/get-auth.action";
import {
  approveLeaveRequestAction,
  recommendLeaveRequestAction,
  rejectLeaveRequestAction,
  approvableLeaveRequestsAction,
} from "@/features/leave-requests/leave-requests.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import {
  LeaveRequest,
  useLeaveRequestsColumns,
} from "./approve-leave-request-columns";
import DataTable, { PaginationState } from "@/shared/table";
import LeaveActionModal from "./approve-leave-request-modal";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import CustomSelect from "@/shared/select";
import { DateRangePicker } from "@/shared/date-range-picker";
import { listUserAction } from "@/features/user/user.action";
import { SearchSelect } from "@/shared/select/search-select";
import { getLeaveTypesAction } from "@/features/leave-types/leave-types.action";
import { resetLeaveRequestState } from "@/features/leave-requests/leave-requests.slice";

export type LeaveAction = "approve" | "reject" | "recommend" | null;

export default function ApproveLeaveRequests() {
  const dispatch = useAppDispatch();
  const { approvableLeaveRequests, isLoading } = useAppSelector(
    (state) => state.leaveRequestSlice
  );

  const currentOrgUUID = useAppSelector(
    (state) => state.userSlice.userCurrentOrganization.uuid
  );

  const { leaveTypes } = useAppSelector((s) => s.leaveTypeSlice);
  const {
    users,
    currentUser,
    isLoading: isUsersLoading,
  } = useAppSelector((state) => state.userSlice);

  const [session, setSession] = useState<Session | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    search: "",
  });

  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start_date?: string;
    end_date?: string;
  }>({ start_date: undefined, end_date: undefined });

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [leaveAction, setLeaveAction] = useState<LeaveAction>(null);
  const [remark, setRemark] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function setUserSession() {
    const userSession = await getSession();
    setSession(userSession);
  }


  const fetchLeaveRequests = () => {
    if (!currentOrgUUID || !session?.user?.uuid) return;

    let date_range = undefined;
    if (dateRangeFilter.start_date && dateRangeFilter.end_date) {
      date_range = [dateRangeFilter.start_date, dateRangeFilter.end_date];
    }

    const params: any = {
      org_uuid: currentOrgUUID,
      manager_uuid: session.user.uuid,
      page: pagination.page,
      limit: pagination.limit,
      search: pagination.search,
      status: statusFilter || LeaveRequestStatus.PENDING,
      leave_type_uuid: leaveTypeFilter || undefined,
      date_range: date_range,
      user_uuid: selectedUser,
      date: date_range
        ? undefined
        : dateRangeFilter.start_date || dateRangeFilter.end_date || undefined,
    };

    dispatch(approvableLeaveRequestsAction(params));
  };

  useEffect(() => {
    setUserSession();
    dispatch(getLeaveTypesAction({ org_uuid: currentOrgUUID }));
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [
    currentOrgUUID,
    session,
    pagination.page,
    pagination.limit,
    pagination.search,
    leaveTypeFilter,
    statusFilter,
    dateRangeFilter.start_date,
    dateRangeFilter.end_date,
    selectedUser,
  ]);

  useEffect(() => {
    dispatch(
      listUserAction({
        org_uuid: currentOrgUUID,
        pagination: {
          page: 1,
          limit: 10,
          search: userFilter,
        },
      })
    );
  }, [userFilter]);

useEffect(() => {
  return () => {
    dispatch(resetLeaveRequestState()); 
  };
}, []);

  const openModal = (lr: LeaveRequest, actionMode: LeaveAction) => {
    setSelected(lr);
    setLeaveAction(actionMode);
    setRemark("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setLeaveAction(null);
    setRemark("");
  };

  const handleModalConfirm = async (remarkText: string) => {
    if (!selected || !leaveAction || !session?.user?.uuid) return;
    if (!currentOrgUUID) {
      console.error("missing org uuid");
      return;
    }

    const payloadWithOrg = {
      leave_request_uuid: selected.uuid,
      manager_uuid: session.user.uuid,
      remark: remarkText,
      org_uuid: currentOrgUUID,
    };

    try {
      setActionLoading(true);
      if (leaveAction === "approve") {
        await dispatch(approveLeaveRequestAction(payloadWithOrg)).unwrap();
      } else if (leaveAction === "reject") {
        await dispatch(rejectLeaveRequestAction(payloadWithOrg)).unwrap();
      } else if (leaveAction === "recommend") {
        await dispatch(recommendLeaveRequestAction(payloadWithOrg)).unwrap();
      }
      closeModal();
      setPagination((p) => ({ ...p, page: 1 }));
      fetchLeaveRequests();
    } catch (err) {
      console.error("action failed", err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  const handleApprove = (lr: LeaveRequest) => openModal(lr, "approve");
  const handleReject = (lr: LeaveRequest) => openModal(lr, "reject");
  const handleRecommend = (lr: LeaveRequest) => openModal(lr, "recommend");

  const columns = useLeaveRequestsColumns({
    onApprove: handleApprove,
    onReject: handleReject,
    onRecommend: handleRecommend,
  });

  const handleUserSearch = (search: string) => {
    setUserFilter(search);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 ">
        <div>
          <h2 className="text-lg font-semibold">Pending Leave Requests</h2>
          <p className="text-sm text-muted-foreground">
            Approve, reject or recommend leave requests assigned to you.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <div>
          <CustomSelect
            value={leaveTypeFilter}
            onValueChange={setLeaveTypeFilter}
            data={leaveTypes.rows.filter((lt) => lt.is_active)}
            label="Leave Type"
            placeholder="Leave type"
            className="w-[200px]"
          />
        </div>

        <div>
          <SearchSelect
            value={selectedUser}
            onValueChange={setSelectedUser}
            onSearch={handleUserSearch}
            data={
              users.filter((user) => user.user_id !== currentUser?.user_id) ??
              []
            }
            label="Users"
            placeholder="Select user"
            className="w-[200px]"
            isLoading={isUsersLoading}
            emptyMessage="No users found."
            displayKey="name"
            valueKey="user_id"
          />
        </div>

        <div>
          <CustomSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            data={LeaveRequestStatus}
            isEnum={true}
            label="Leave Status"
            placeholder="Status"
            className="w-[200px]"
          />
        </div>

        <div>
          <DateRangePicker
            setDateRange={setDateRangeFilter}
            isDependant={false}
            className="w-[180px]"
          />
        </div>
      </div>

      <DataTable
        data={approvableLeaveRequests?.rows ?? []}
        columns={columns}
        isLoading={isLoading}
        totalCount={approvableLeaveRequests?.count ?? 0}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        searchable={false}
        noDataMessage="No leave requests found."
      />

      <LeaveActionModal
        open={modalOpen}
        action={leaveAction}
        initialRemark={remark}
        submitting={actionLoading}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
