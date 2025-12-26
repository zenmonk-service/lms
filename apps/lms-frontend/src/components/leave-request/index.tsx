"use client";

import React, { useEffect, useState } from "react";
import DataTable, { PaginationState } from "@/shared/table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  deleteLeaveRequestOfUserAction,
  getUserLeaveRequestsAction,
} from "@/features/leave-requests/leave-requests.action";
import { getSession } from "@/app/auth/get-auth.action";
import MakeLeaveRequest from "./make-leave-request";
import {
  LeaveRequestStatusChangedBy,
  useLeaveRequestColumns,
} from "./make-leave-request/leave-request-columns";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import { DateRangePicker } from "@/shared/date-range-picker";

import CustomSelect from "@/shared/select";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "../ui/multi-select";
import { LeaveRequestModal } from "./make-leave-request/leave-request-modal";
import { hasPermissions } from "@/lib/haspermissios";
import NoReadPermission from "@/shared/no-read-permission";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { resetLeaveRequestState } from "@/features/leave-requests/leave-requests.slice";
import InfiniteScroll from "react-infinite-scroll-component";
import { listUserAction } from "@/features/user/user.action";
import { LoaderCircle } from "lucide-react";
import { UserInterface } from "@/features/user/user.slice";

export type LeaveRequestType = {
  uuid: string;
  id?: number;
  user?: {
    uuid?: string;
    name?: string;
    email?: string;
  };
  leave_type?: {
    uuid?: string;
    name?: string;
    code?: string;
  };
  start_date?: string;
  end_date?: string | null;
  type?: string;
  range?: string;
  leave_duration?: number | null;
  reason?: string | null;
  status?: LeaveRequestStatus;
  status_changed_by?: LeaveRequestStatusChangedBy[] | null;
  created_at?: string;
  updated_at?: string;
};

const LeaveRequest = () => {
  const [session, setSession] = useState<any>(null);
  const {
    users,
    currentUser,
    total,
    currentPage,
    isLoading: isUsersLoading,
  } = useAppSelector((state) => state.userSlice);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: undefined,
    end_date: undefined,
  });

  const [data, setData] = useState<LeaveRequestType>();
  const [modalOpen, setModalOpen] = useState(false);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice
  );
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedLeaveRequestUuid, setSelectedLeaveRequestUuid] = useState<
    string | null
  >(null);

  const { userLeaveRequests, isLoading } = useAppSelector(
    (state) => state.leaveRequestSlice
  );
  const { leaveTypes } = useAppSelector((state) => state.leaveTypeSlice);

  const currentOrganizationUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid
  );
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    search: "",
  });
  const dispatch = useAppDispatch();

  async function getUserUuid() {
    const session = await getSession();
    setSession(session);
  }

  useEffect(() => {
    dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchTerm },
        org_uuid: currentOrganizationUuid,
      })
    );
  }, [searchTerm]);

  useEffect(() => {
    async function fetchUserLeaves() {
      await getUserUuid();
      let date_range = undefined;
      if (dateRangeFilter.start_date && dateRangeFilter.end_date) {
        date_range = [dateRangeFilter.start_date, dateRangeFilter.end_date];
      }

      const data = {
        leave_type_uuid: leaveTypeFilter || undefined,
        managers: managerFilter || undefined,
        status: statusFilter || undefined,
        date_range: date_range,
        date: date_range ? undefined : dateRangeFilter.start_date,
      };
      if (session)
        dispatch(
          getUserLeaveRequestsAction({
            org_uuid: currentOrganizationUuid,
            user_uuid: session?.user?.uuid,
            page: pagination.page,
            limit: pagination.limit,
            search: pagination.search,
            ...data,
          })
        );
    }
    fetchUserLeaves();
  }, [
    session?.user?.uuid,
    pagination,
    dispatch,
    currentOrganizationUuid,
    leaveTypeFilter,
    managerFilter,
    statusFilter,
    dateRangeFilter,
  ]);

  useEffect(() => {
    return () => {
      dispatch(resetLeaveRequestState());
    };
  }, []);

  const onEdit = (row: any) => {
    setData(row);
    setModalOpen(true);
  };

  const onDelete = (leave_request_uuid: string) => {
    setSelectedLeaveRequestUuid(leave_request_uuid);
    setConfirmationOpen(true);
  };

  const columns = useLeaveRequestColumns({
    onEdit,
    onDelete,
  });

  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  return (
    <div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">All Leave Requests</h2>
            <p className="text-sm text-muted-foreground">
              List of all leave requests made by users.
            </p>
          </div>
          {hasPermissions(
            "leave_request_management",
            "create",
            currentUserRolePermissions,
            currentUser?.email
          ) && <MakeLeaveRequest />}
        </div>

        {hasPermissions(
          "leave_request_management",
          "read",
          currentUserRolePermissions,
          currentUser?.email
        ) ? (
          <>
            <div className="flex flex-wrap gap-2 justify-end">
              <div>
                <CustomSelect
                  value={leaveTypeFilter}
                  onValueChange={setLeaveTypeFilter}
                  data={leaveTypes.rows.filter((lt) => lt.is_active)}
                  label="Leave Type"
                  placeholder="Leave type"
                  className="w-[180px]"
                />
              </div>

              <div>
                <MultiSelect
                  values={managerFilter}
                  onValuesChange={setManagerFilter}
                >
                  <MultiSelectTrigger className="w-[180px] hover:bg-transparent">
                    <MultiSelectValue
                      overflowBehavior="cutoff"
                      placeholder="Select managers..."
                    />
                  </MultiSelectTrigger>
                  <MultiSelectContent
                    search={{
                      emptyMessage: "No managers found.",
                      placeholder: "Search managers...",
                    }}
                    onSearch={setSearchTerm}
                    isLoading={isUsersLoading}
                  >
                    <MultiSelectGroup>
                      <InfiniteScroll
                        dataLength={users.length}
                        next={() =>
                          dispatch(
                            listUserAction({
                              pagination: {
                                page: currentPage + 1,
                                limit: 10,
                                search: searchTerm,
                              },
                              org_uuid: currentOrganizationUuid,
                              isInfiniteScroll: true,
                            })
                          )
                        }
                        hasMore={users.length < total}
                        loader={
                          <LoaderCircle className="animate-spin mx-auto my-2" />
                        }
                        height={100}
                        className="max-h-[100px]"
                      >
                        {users
                          .filter(
                            (manager) => manager.user_id !== session?.user?.uuid
                          )
                          .map((manager: UserInterface) => (
                            <MultiSelectItem
                              value={manager.user_id}
                              key={manager.user_id}
                            >
                              {manager.name}
                            </MultiSelectItem>
                          ))}
                      </InfiniteScroll>
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
              </div>

              <div>
                <CustomSelect
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  data={LeaveRequestStatus}
                  isEnum={true}
                  label="Leave Status"
                  placeholder="Status"
                  className="w-[180px]"
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
              data={userLeaveRequests.rows || []}
              columns={columns}
              isLoading={isLoading}
              searchable={false}
              totalCount={userLeaveRequests.count || 0}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              noDataMessage="No leave request found."
            />
          </>
        ) : (
          <NoReadPermission />
        )}
        <ConfirmationDialog
          open={confirmationOpen}
          onOpenChange={setConfirmationOpen}
          description="This action cannot be undone. This will permanently delete this leave request."
          handleConfirm={async () => {
            await dispatch(
              deleteLeaveRequestOfUserAction({
                user_uuid: currentUser?.user_id,
                leave_request_uuid: selectedLeaveRequestUuid,
              })
            );
            await dispatch(
              getUserLeaveRequestsAction({
                org_uuid: currentOrganizationUuid,
                user_uuid: session?.user?.uuid,
              })
            );
          }}
        />

        <LeaveRequestModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onClose={() => setModalOpen(false)}
          data={data}
          leave_request_uuid={data?.uuid}
        />
      </div>
    </div>
  );
};

export default LeaveRequest;
