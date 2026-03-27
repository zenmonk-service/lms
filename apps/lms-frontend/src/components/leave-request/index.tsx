"use client";

import { useEffect, useState } from "react";
import { PaginationState } from "@/shared/table";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  deleteLeaveRequestOfUserAction,
  getUserLeaveRequestsAction,
} from "@/features/leave-requests/leave-requests.action";
import { getSession } from "@/app/auth/get-auth.action";
import MakeLeaveRequest from "./make-leave-request";
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
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { resetLeaveRequestState } from "@/features/leave-requests/leave-requests.slice";
import InfiniteScroll from "react-infinite-scroll-component";
import { listUserAction } from "@/features/user/user.action";
import {
  LoaderCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { UserInterface } from "@/features/user/user.slice";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Label } from "../ui/label";
import LeaveHistory from "./leave-history";
import Title from "@/shared/typography/title";

interface LeaveRequestStatusChangedBy {
  user_id: string;
  name: string;
  email: string;
}

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

const LeaveRequest = ({
  isView = false,
  userUUId,
}: {
  isView?: boolean;
  userUUId?: string;
}) => {
  const {
    users,
    currentUser,
    total,
    currentPage,
    isLoading: isUsersLoading,
  } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );
  const {
    userLeaveRequests,
    isLoading: isLeaveLoading,
    isLoadingMore,
  } = useAppSelector((state) => state.leaveRequestSlice);
  const { leaveTypes } = useAppSelector((state) => state.leaveTypeSlice);
  const currentOrganizationUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const dispatch = useAppDispatch();

  const [session, setSession] = useState<any>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedLeaveRequestUuid, setSelectedLeaveRequestUuid] = useState<
    string | null
  >(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [openFilters, setOpenFilters] = useState(false);
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
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    search: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function getUserUuid() {
    const session = await getSession();
    setSession(session);
  }

  async function fetchUsers() {
    await dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchTerm },
        org_uuid: currentOrganizationUuid,
      }),
    );
  }

  async function fetchUserLeaves() {
    const isFirstPageLoad = pagination.page === 1;
    setIsLoading(isFirstPageLoad);
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

    try {
      if (session) {
        await dispatch(
          getUserLeaveRequestsAction({
            org_uuid: currentOrganizationUuid,
            user_uuid: userUUId || session?.user?.uuid,
            page: pagination.page,
            limit: pagination.limit,
            search: pagination.search,
            ...data,
          }),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUserLeaves();
  }, [session?.user?.uuid, currentOrganizationUuid, pagination ,userUUId]);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  useEffect(() => {
    getUserUuid();

    return () => {
      dispatch(resetLeaveRequestState());
    };
  }, []);

  useEffect(() => {
    handlePaginationChange({ page: 1 });
  }, [leaveTypeFilter, managerFilter, statusFilter, dateRangeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== "") {
        handlePaginationChange({ search: searchInput, page: 1 });
      } else if (pagination.search !== "") {
        handlePaginationChange({ search: "", page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const onEdit = (row: any) => {
    setData(row);
    setModalOpen(true);
  };

  const onDelete = (leave_request_uuid: string) => {
    setSelectedLeaveRequestUuid(leave_request_uuid);
    setConfirmationOpen(true);
  };

  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  return (
    <div className={ isView ? "" : "flex flex-col items-center" }>
      <div className={ isView ? "" : "w-1/2 sm:w-3/4 p-6"}>
        <Title
          title={{
            text: "Leave Requests",
            className: "",
          }}
          description={{
            text: "Manage your leave applications and track manager feedback and recommendations.",
            className: "",
          }}
          className=""
          button={
            hasPermissions(
              "leave_request_management",
              "create",
              currentUserRolePermissions,
              currentUser?.email,
            ) && !isView && <MakeLeaveRequest />
          }
        />

        {hasPermissions(
          "leave_request_management",
          "read",
          currentUserRolePermissions,
          currentUser?.email,
        ) && (
          <div>
            <div className="flex flex-col bg-card p-4 rounded-md shadow-sm mb-6 gap-6">
              <div className="flex items-center gap-2 ">
                <InputGroup>
                  <InputGroupInput
                    placeholder="Search your leave requests by reason..."
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                </InputGroup>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenFilters(!openFilters)}
                >
                  <SlidersHorizontal />
                  Advanced Filters
                </Button>
              </div>

              <div
                className={`grid grid-cols-3 gap-3 ${openFilters ? "" : "hidden"}`}
              >
                <div className="flex flex-col gap-2">
                  <Label>Leave Category</Label>
                  <CustomSelect
                    value={leaveTypeFilter}
                    onValueChange={setLeaveTypeFilter}
                    data={leaveTypes.rows.filter((lt) => lt.is_active)}
                    label="Leave Type"
                    placeholder="Select leave category"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Reviewer List</Label>
                  <MultiSelect
                    values={managerFilter}
                    onValuesChange={setManagerFilter}
                  >
                    <MultiSelectTrigger className="w-full hover:bg-transparent">
                      <MultiSelectValue
                        overflowBehavior="cutoff"
                        placeholder="Select managers"
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
                              }),
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
                              (manager) =>
                                manager.user_id !== session?.user?.uuid,
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

                <div className="flex flex-col gap-2">
                  <Label>Request Status</Label>
                  <CustomSelect
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    data={LeaveRequestStatus}
                    isEnum={true}
                    label="Leave Status"
                    placeholder="Select leave status"
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Scheduled Date</Label>
                  <DateRangePicker
                    setDateRange={setDateRangeFilter}
                    isDependant={false}
                  />
                </div>
              </div>
            </div>
            <LeaveHistory
              userUUid={userUUId || currentUser?.user_id}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              paginationPage={pagination.page}
              userLeaveRequests={userLeaveRequests}
              handlePaginationChange={(nextPagination) =>
                handlePaginationChange(nextPagination)
              }
              isView={isView}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        description="This action cannot be undone. This will permanently delete this leave request."
        handleConfirm={async () => {
          await dispatch(
            deleteLeaveRequestOfUserAction({
              user_uuid: currentUser?.user_id,
              leave_request_uuid: selectedLeaveRequestUuid,
            }),
          );
          await dispatch(
            getUserLeaveRequestsAction({
              org_uuid: currentOrganizationUuid,
              user_uuid: session?.user?.uuid,
            }),
          );
        }}
        isLoading={isLeaveLoading}
      />

      <LeaveRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onClose={() => setModalOpen(false)}
        data={data}
        leave_request_uuid={data?.uuid}
      />
    </div>
  );
};

export default LeaveRequest;
