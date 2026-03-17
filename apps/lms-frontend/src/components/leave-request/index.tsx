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
  ArrowRight,
  Briefcase,
  Circle,
  CircleArrowOutUpRight,
  CircleCheck,
  CircleX,
  Clock,
  Edit,
  Fingerprint,
  Info,
  LoaderCircle,
  RefreshCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Trash2,
  TrendingUpIcon,
} from "lucide-react";
import { UserInterface } from "@/features/user/user.slice";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { LeaveRequestSkeleton } from "./skeleton";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import NoDataFound from "@/shared/no-data-found";

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

const LeaveRequest = () => {
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
  const { userLeaveRequests, isLoading: isLeaveLoading, isLoadingMore } = useAppSelector(
    (state) => state.leaveRequestSlice,
  );
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
    setIsLoading(true);
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
      await dispatch(
        getUserLeaveRequestsAction({
          org_uuid: currentOrganizationUuid,
          user_uuid: session?.user?.uuid,
          page: pagination.page,
          limit: pagination.limit,
          search: pagination.search,
          ...data,
        }),
      );
    
      setIsLoading(false);
  }

  useEffect(() => {
    fetchUserLeaves();
  }, [session?.user?.uuid, currentOrganizationUuid, pagination]);

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

  function getIcon(status: LeaveRequestStatus | null) {
    switch (status) {
      case null:
        return <Circle size={18} className="text-muted fill-background z-10" />;
      case LeaveRequestStatus.APPROVED:
        return <CircleCheck size={18} className="fill-primary z-10" />;
      case LeaveRequestStatus.REJECTED:
        return <CircleX size={18} className="fill-destructive z-10" />;
      case LeaveRequestStatus.RECOMMENDED:
        return (
          <CircleArrowOutUpRight
            size={18}
            className="text-muted fill-accent z-10"
          />
        );
      case LeaveRequestStatus.CANCELLED:
        return <CircleX size={18} className="fill-destructive z-10" />;
      default:
        return null;
    }
  }

  function getBadge(status: LeaveRequestStatus) {
    switch (status) {
      case LeaveRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="rounded-sm">
            <Clock size={12} />
            Pending
          </Badge>
        );
      case LeaveRequestStatus.APPROVED:
        return (
          <Badge variant="success" className="rounded-sm">
            <CircleCheck size={12} /> Approved
          </Badge>
        );
      case LeaveRequestStatus.REJECTED:
        return (
          <Badge variant="destructive" className="rounded-sm">
            <CircleX size={12} /> Rejected
          </Badge>
        );
      case LeaveRequestStatus.RECOMMENDED:
        return (
          <Badge variant="default" className="rounded-sm">
            <TrendingUpIcon size={12} /> Recommended
          </Badge>
        );
      case LeaveRequestStatus.CANCELLED:
        return (
          <Badge variant="destructive" className="rounded-sm">
            <CircleX size={12} /> Cancelled
          </Badge>
        );
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-1/2 sm:w-3/4 p-6">
        <div className="mb-4">
          <div className="flex justify-between">
            <h1 className="text-lg font-bold">Leave Requests</h1>
            {hasPermissions(
              "leave_request_management",
              "create",
              currentUserRolePermissions,
              currentUser?.email,
            ) && <MakeLeaveRequest />}
          </div>
          <p className="text-muted-foreground max-w-80 text-sm">
            Manage your leave applications and track manager feedback and
            recommendations.
          </p>
        </div>

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

            <div>
              <div className="flex items-center justify-between">
                <p className="uppercase text-[11px] font-bold tracking-widest ">
                  Your Leave History
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"ghost"}
                      size={"icon-sm"}
                      onClick={() => handlePaginationChange({ page: 1 })}
                      disabled={isLoading}
                    >
                      <RefreshCcw
                        className={`${isLoading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh Leave History</TooltipContent>
                </Tooltip>
              </div>

              {isLoading ? (
                <LeaveRequestSkeleton />
              ) : userLeaveRequests.rows.length === 0 ? (
                <div className="min-h-[calc(100vh-309px)] flex justify-center items-center flex-col bg-card p-6 rounded-lg border border-border shadow-sm">
                  <NoDataFound
                    message="Your leave dashboard is currently empty. Start by submitting your first request to track approvals and manager feedback."
                  />
                </div>
              ) : (
                <Accordion
                  id="scrollable-accordian"
                  type="single"
                  collapsible
                  className="w-full bg-card pb-4 rounded-md mt-4 shadow-sm max-h-[calc(100vh-327px)] overflow-auto"
                  defaultValue={`${userLeaveRequests.rows[0]?.uuid}`}
                >
                  <InfiniteScroll
                    dataLength={userLeaveRequests.rows.length}
                    next={() =>
                      handlePaginationChange({ page: pagination.page + 1 })
                    }
                    hasMore={
                      (userLeaveRequests.total || 0) >
                      userLeaveRequests.rows.length
                    }
                    loader={
                      isLoadingMore
                        ? [1, 2].map((item) => (
                            <div
                              key={item}
                              className="border-b border-border py-4"
                            >
                              <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-md" />
                                <div className="flex flex-col gap-2">
                                  <Skeleton className="h-5 w-32" />
                                  <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="ml-3 space-y-2">
                                  <Skeleton className="h-4 w-16" />
                                  <Skeleton className="h-3 w-32" />
                                </div>
                                <div className="flex flex-col gap-2 ml-3">
                                  <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="ml-auto">
                                  <Skeleton className="h-6 w-24 rounded-sm" />
                                </div>
                              </div>
                            </div>
                          ))
                        : null
                    }
                    scrollableTarget="scrollable-accordian"
                  >
                    {userLeaveRequests &&
                      userLeaveRequests.rows.length > 0 &&
                      userLeaveRequests.rows.map((leaveRequest) => (
                        <AccordionItem
                          key={leaveRequest.uuid}
                          value={leaveRequest.uuid}
                        >
                          <AccordionTrigger className="hover:no-underline hover:bg-accent/40 px-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-muted p-2 rounded-md">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <p className="font-black">
                                  {leaveRequest.leave_type.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Fingerprint size={10} />
                                  <span>
                                    {leaveRequest.leave_duration} days
                                  </span>
                                </p>
                              </div>

                              <div className="ml-3">
                                <p className="uppercase font-bold text-xs">
                                  Duration
                                </p>
                                <div className="flex items-center">
                                  <p className="text-muted-foreground font-semibold text-xs">
                                    {leaveRequest.start_date}
                                  </p>
                                  <ArrowRight
                                    className="mx-1 text-muted-foreground"
                                    strokeWidth={2}
                                    size={12}
                                  />
                                  <p className="text-muted-foreground font-semibold text-xs">
                                    {leaveRequest.end_date}
                                  </p>
                                </div>
                              </div>

                              <div className="flex-1 flex flex-col items-start ml-3">
                                <p className="uppercase font-bold text-xs">
                                  Managers
                                </p>
                                <div className="flex gap-2">
                                  {leaveRequest.managers
                                    .slice(0, 2)
                                    .map((manager) => (
                                      <Badge
                                        variant={"outline"}
                                        key={manager.user.user_id}
                                        className="rounded-sm text-xs"
                                      >
                                        {manager.user.name}
                                      </Badge>
                                    ))}
                                  {leaveRequest.managers.length > 2 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          variant={"outline"}
                                          className="rounded-sm text-xs"
                                        >
                                          +{leaveRequest.managers.length - 2}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        align="start"
                                        className="max-w-80"
                                      >
                                        {leaveRequest.managers
                                          .slice(2)
                                          .map((manager, index) => (
                                            <span key={index}>
                                              {manager.user.name}{" "}
                                              {index !==
                                              leaveRequest.managers.slice(2)
                                                .length -
                                                1
                                                ? ","
                                                : ""}
                                            </span>
                                          ))}
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="ml-auto mr-4">
                              {getBadge(leaveRequest.status!)}
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="flex flex-col gap-4 px-4">
                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center gap-1">
                                  <Shield className="w-4 h-4 text-primary" />
                                  <p className="uppercase font-bold text-xs text-muted-foreground">
                                    Management decision
                                  </p>
                                </div>
                                <div className="relative">
                                  <div className="absolute left-2 top-4.25 bottom-1 w-[1.5px] bg-muted" />
                                  {leaveRequest.managers.map((manager) => (
                                    <div
                                      className="mt-4"
                                      key={manager.user.user_id}
                                    >
                                      <div className="flex gap-3">
                                        {getIcon(manager.status_changed_to)}
                                        <div className="flex flex-col">
                                          <p className="font-semibold">
                                            {manager.user.name}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground">
                                            {manager.user.role.name}
                                          </p>
                                        </div>
                                        <div className="ml-auto">
                                          {getBadge(manager.status_changed_to!)}
                                        </div>
                                      </div>
                                      <div className="ml-7.5">
                                        {manager.remarks ? (
                                          <div className="p-3 bg-accent/20 border border-border rounded-lg shadow-sm mt-2">
                                            <p className="italic text-xs wrap-break-word">
                                              "{manager.remarks}"
                                            </p>
                                          </div>
                                        ) : (
                                          <p className="mt-2.5 text-[10px] italic text-muted-foreground">
                                            No remark provided
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-accent/20 p-4 border border-border rounded-xl space-y-1">
                                    <h3 className="uppercase text-[9px] text-muted-foreground font-black tracking-wider">
                                      Leave profile
                                    </h3>
                                    <p className="text-sm font-bold">
                                      {" "}
                                      {leaveRequest.type
                                        .replaceAll("_", " ")
                                        .split(" ")
                                        .map(
                                          (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1).toLowerCase(),
                                        )
                                        .join(" ")}
                                    </p>
                                  </div>
                                  <div className="bg-accent/20 p-4 border border-border rounded-xl space-y-1">
                                    <h3 className="uppercase text-[9px] text-muted-foreground font-black tracking-wider">
                                      Total credit cost
                                    </h3>
                                    <p className="text-sm font-bold">
                                      {" "}
                                      {leaveRequest.effective_days || "-"}
                                    </p>
                                  </div>
                                </div>

                                {leaveRequest.reason && (
                                  <div className="mt-4 border border-primary rounded-lg shadow-sm p-4 bg-accent/20">
                                    <div className="flex items-center gap-2">
                                      <Info
                                        size={16}
                                        className="text-primary"
                                      />
                                      <h3 className="uppercase text-xs font-black tracking-wider">
                                        Requester Notes
                                      </h3>
                                    </div>
                                    <p className="text-xs mt-4 wrap-break-word">
                                      {leaveRequest.reason}
                                    </p>
                                  </div>
                                )}

                                {leaveRequest.status ===
                                  LeaveRequestStatus.PENDING && (
                                  <>
                                    <Separator className="my-4" />

                                    <div className="flex gap-4 justify-end">
                                      <Button
                                        variant={"destructive"}
                                        size={"sm"}
                                        onClick={() =>
                                          onDelete(leaveRequest.uuid)
                                        }
                                      >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        <span className="text-xs">
                                          Withdraw Request
                                        </span>
                                      </Button>
                                      <Button
                                        variant={"default"}
                                        size={"sm"}
                                        onClick={() => onEdit(leaveRequest)}
                                      >
                                        <Edit className="w-4 h-4 mr-1" />
                                        <span className="text-xs">
                                          Modify Request
                                        </span>
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </InfiniteScroll>
                </Accordion>
              )}
            </div>
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
