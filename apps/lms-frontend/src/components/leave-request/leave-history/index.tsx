"use client";

import { useEffect, type ReactNode } from "react";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import NoDataFound from "@/shared/no-data-found";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Briefcase,
  Coins,
  Edit,
  Fingerprint,
  Info,
  RefreshCcw,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAppDispatch, useAppSelector } from "@/store";
import { getUserLeaveBalancesAction } from "@/features/leave-types/leave-types.action";
import { getIcon, getStatusBadge } from "@/utils/get-badge";
import { LeaveHistorySkeleton } from "./skeleton";
import { LeaveRequestSkeleton } from "../skeleton";

type LeaveRequestManager = {
  remarks?: string | null;
  status_changed_to?: LeaveRequestStatus | null;
  user: {
    user_id: string;
    name: string;
    role: {
      name: string;
    };
  };
};

export type LeaveRequestHistoryRow = {
  uuid: string;
  leave_type?: {
    name: string;
  };
  leave_duration: string | number;
  start_date: string;
  end_date: string;
  managers: LeaveRequestManager[];
  status: LeaveRequestStatus;
  reason?: string | null;
  type: string;
  effective_days?: string | number | null;
};

type LeaveHistoryProps = {
  readonly userUUid: string;
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly paginationPage: number;
  readonly userLeaveRequests: {
    readonly rows: LeaveRequestHistoryRow[];
    readonly total?: number;
  };
  readonly isView: boolean;
  readonly handlePaginationChange: (pagination: { page: number }) => void;
  readonly onDelete?: (leaveRequestUuid: string) => void;
  readonly onEdit?: (leaveRequest: LeaveRequestHistoryRow) => void;
};

type UserLeaveBalance = {
  leaves_allocated: number;
  balance: string;
  period: string;
  leave_type: {
    code: string;
    name: string;
    allow_negative_leaves?: boolean;
    accrual?: {
      period?: string;
      applicable_on?: string;
      leave_count?: number;
    };
  };
};

export default function LeaveHistory({
  userUUid, 
  isLoading,
  isLoadingMore,
  paginationPage,
  userLeaveRequests,
  isView = false,
  handlePaginationChange,
  onDelete,
  onEdit,
}: LeaveHistoryProps) {
  const dispatch = useAppDispatch();
  const organizationUUID = useAppSelector(
    (state) => state.organizationsSlice?.currentOrganization?.uuid,
  );
  const { userLeaveBalances, isLoading: isLeaveBalancesLoading } = useAppSelector((state) => state.leaveTypeSlice);
  const currentPeriod = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1,
  ).padStart(2, "0")}`;
  const leaveBalances = (userLeaveBalances || []) as UserLeaveBalance[];

  useEffect(() => {
    if (!organizationUUID ) return;

    dispatch(
      getUserLeaveBalancesAction({
        user_uuid: userUUid ,
        org_uuid: organizationUUID,
        period: currentPeriod,
      }),
    );
  }, [organizationUUID, currentPeriod, dispatch ,userUUid]);

  let historyContent: ReactNode;
  if (isLoading) {
    historyContent = <LeaveRequestSkeleton />;
  } else if (userLeaveRequests.rows.length === 0) {
    historyContent = (
      <div className="min-h-[calc(100vh-309px)] flex justify-center items-center flex-col bg-card p-6 rounded-lg border border-border">
        <NoDataFound message="Your leave dashboard is currently empty. Start by submitting your first request to track approvals and manager feedback." />
      </div>
    );
  } else {
    historyContent = (
      <Accordion
        id="scrollable-accordion"
        type="single"
        collapsible
        className="w-full bg-card rounded-md shadow-sm max-h-[calc(100vh-327px)] overflow-auto border border-border"
        defaultValue={`${userLeaveRequests.rows[0]?.uuid}`}
      >
        <InfiniteScroll
          dataLength={userLeaveRequests.rows.length}
          next={() => handlePaginationChange({ page: paginationPage + 1 })}
          hasMore={
            (userLeaveRequests.total || 0) > userLeaveRequests.rows.length
          }
          loader={
            isLoadingMore
              ? [1, 2].map((item) => (
                  <div
                    key={`skeleton-${item}`}
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
          scrollableTarget="scrollable-accordion"
        >
          {userLeaveRequests.rows.map((leaveRequest) => (
            <AccordionItem key={leaveRequest.uuid} value={leaveRequest.uuid} className="last:border-b-0">
              <AccordionTrigger className="hover:no-underline hover:bg-accent/40 px-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-md">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-black">
                      {leaveRequest.leave_type?.name ?? "-"}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Fingerprint size={10} />
                      <span>{leaveRequest.leave_duration} days</span>
                    </p>
                  </div>

                  <div className="ml-3">
                    <p className="uppercase font-bold text-xs">Duration</p>
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
                    <p className="uppercase font-bold text-xs">Managers</p>
                    <div className="flex gap-2">
                      {leaveRequest.managers.slice(0, 2).map((manager) => (
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
                          <TooltipContent align="start" className="max-w-80">
                            {leaveRequest.managers
                              .slice(2)
                              .map((manager, index) => {
                                const isLastItem =
                                  index ===
                                  leaveRequest.managers.slice(2).length - 1;
                                return (
                                  <span
                                    key={`${manager.user.user_id}-${index}`}
                                  >
                                    {manager.user.name} {isLastItem ? "" : ","}
                                  </span>
                                );
                              })}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-auto mr-4">
                  {getStatusBadge(leaveRequest.status)}
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
                        <div className="mt-4" key={manager.user.user_id}>
                          <div className="flex gap-3">
                            {getIcon(manager.status_changed_to ?? null)}
                            <div className="flex flex-col">
                              <p className="font-semibold">
                                {manager.user.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {manager.user.role.name}
                              </p>
                            </div>
                            <div className="ml-auto">
                              {manager.status_changed_to
                                ? getStatusBadge(manager.status_changed_to)
                                : null}
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
                          {leaveRequest.effective_days || "-"}
                        </p>
                      </div>
                    </div>

                    {leaveRequest.reason && (
                      <div className="mt-4 border border-primary rounded-lg shadow-sm p-4 bg-accent/20">
                        <div className="flex items-center gap-2">
                          <Info size={16} className="text-primary" />
                          <h3 className="uppercase text-xs">
                            Requester Notes
                          </h3>
                        </div>
                        <p className="text-xs mt-4 wrap-break-word">
                          {leaveRequest.reason}
                        </p>
                      </div>
                    )}

                    {leaveRequest.status === LeaveRequestStatus.PENDING && (
                      <>
                        <Separator className="my-4" />
                        {!isView && (
                          <div className="flex gap-4 justify-end">
                            <Button
                              variant={"destructive"}
                              size={"sm"}
                              onClick={() => onDelete && onDelete(leaveRequest.uuid)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              <span className="text-xs">Withdraw Request</span>
                            </Button>
                            <Button
                              variant={"default"}
                              size={"sm"}
                              onClick={() => onEdit && onEdit(leaveRequest)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              <span className="text-xs">Modify Request</span>
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </InfiniteScroll>
      </Accordion>
    );
  }
  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="uppercase text-[11px] font-bold tracking-widest">
            Leave Balances
          </p>
          <Badge variant="outline" className="rounded-sm text-[10px]">
            {currentPeriod}
          </Badge>
        </div>

        {isLeaveBalancesLoading ? <LeaveHistorySkeleton /> : leaveBalances.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No leave balances available for this period.
          </p>
        ) : (
          <div className="relative flex items-center gap-2">
            <Carousel opts={{ align: "start" }} className="w-full flex-1">
              <CarouselPrevious className="h-7 w-7 rounded-md shadow-none shrink-0" />
              <CarouselContent>
                {leaveBalances.map((item) =>
                  (() => {
                    const numericBalance = Number(item.balance || 0);
                    const allocated = Number(item.leaves_allocated || 0);
                    const usagePercent =
                      allocated > 0
                        ? Math.max(
                            0,
                            Math.min(100, (numericBalance / allocated) * 100),
                          )
                        : 0;

                    const accrualPeriod = item.leave_type.accrual?.period
                      ?.replaceAll("_", " ")
                      .toUpperCase();

                    return (
                      <CarouselItem
                        key={item.leave_type.code}
                        className="basis-full sm:basis-1/2 lg:basis-1/3"
                      >
                        <div className="p-0.5">
                          <Card className="border border-border shadow-none rounded-lg bg-card py-0 gap-0">
                            <CardContent className="px-2 py-2 space-y-2">
                              <div className="flex items-center justify-between gap-1">
                                <Badge
                                  variant="outline"
                                  className="rounded-sm text-[9px] font-semibold px-1.5 py-0"
                                >
                                  {item.leave_type.code}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="rounded-sm text-[9px] px-1.5 py-0"
                                >
                                  <Coins className="w-3 h-3 mr-1" />
                                  Allocated {allocated}
                                </Badge>
                              </div>

                              <p className="font-semibold text-xs line-clamp-1">
                                {item.leave_type.name}
                              </p>

                              <div className="flex items-end justify-between">
                                <p className="text-lg font-bold text-primary leading-none">
                                  {numericBalance.toFixed(2)}
                                </p>
                                <p className="text-[9px] text-muted-foreground">
                                  available
                                </p>
                              </div>

                              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                                <span>ratio</span>
                                <span>{usagePercent.toFixed(0)}%</span>
                              </div>

                              <div className="flex flex-wrap gap-1 pt-0.5">
                                <Badge
                                  variant="outline"
                                  className="rounded-sm text-[9px] px-1.5 py-0"
                                >
                                  <CalendarClock className="w-3 h-3 mr-1" />
                                  {accrualPeriod || "NO ACCRUAL"}
                                </Badge>

                                {item.leave_type.allow_negative_leaves ? (
                                  <Badge
                                    variant="default"
                                    className="rounded-sm text-[9px] px-1.5 py-0"
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Negative
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="rounded-sm text-[9px] px-1.5 py-0"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    No-negative
                                  </Badge>
                                )}
                              </div>

                              <p className="text-[9px] text-muted-foreground">
                                {item.period}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    );
                  })(),
                )}
              </CarouselContent>
              <CarouselNext className="h-7 w-7 rounded-md shadow-none shrink-0" />
            </Carousel>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="uppercase text-[11px] font-bold tracking-widest">
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
              <RefreshCcw className={`${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh Leave History</TooltipContent>
        </Tooltip>
      </div>

      {historyContent}
    </div>
  );
}
