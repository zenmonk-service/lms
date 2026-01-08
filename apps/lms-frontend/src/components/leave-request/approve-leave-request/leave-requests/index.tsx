"use client";

import { getSession } from "@/app/auth/get-auth.action";
import { approvableLeaveRequestsAction } from "@/features/leave-requests/leave-requests.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { ClipboardX, RefreshCw } from "lucide-react";
import { Session } from "next-auth";
import React, { useEffect, useState } from "react";
import UserCard from "./card";
import LeaveRequestSkeleton from "./skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import InfiniteScroll from "react-infinite-scroll-component";
import { Skeleton } from "@/components/ui/skeleton";
import { resetSelectedLeaveRequest, resetSelectedLeaveRequestDetails } from "@/features/leave-requests/leave-requests.slice";

const LeaveRequests = () => {
  const { isLoading: isLeaveTypeLoading } = useAppSelector(
    (s) => s.leaveTypeSlice
  );

  const { approvableLeaveRequests, leaveFilters, isLoading } = useAppSelector(
    (state) => state.leaveRequestSlice
  );
  const { currentUser } = useAppSelector(
    (state) => state.userSlice
  );
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const dispatch = useAppDispatch();

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  async function setUserSession() {
    const userSession = await getSession();
    setSession(userSession);
  }

  useEffect(() => {
    setUserSession();
  }, []);

  const params = (page: number, isInfiniteScroll = true) => ({
    org_uuid: currentOrganization.uuid,
    manager_uuid: currentUser?.user_id,
    page,
    limit: 10,
    isInfiniteScroll,
    status: leaveFilters?.status
      ? leaveFilters.status.replace(
          /^([A-Z])([A-Z]*)$/,
          (_, first, rest) => first + rest.toLowerCase()
        )
      : undefined,
    leave_type_uuid: leaveFilters?.leave_type_uuid,
    date_range: leaveFilters?.date_range,
    user_uuid: leaveFilters?.user_uuid,
    date: leaveFilters?.date,
  });

  const refreshLeaveRequests = async () => {
    if (!currentOrganization.uuid || !currentUser?.user_id) return;
    dispatch(resetSelectedLeaveRequestDetails());
    dispatch(resetSelectedLeaveRequest());
    await dispatch(approvableLeaveRequestsAction(params(1, true)));
  };

  const fetchMoreLeaveRequests = async () => {
    if (!currentOrganization.uuid || !currentUser?.user_id) return;
    setIsLoadingMore(true);
    const nextPage = (approvableLeaveRequests.current_page ?? 0) + 1;
    await dispatch(approvableLeaveRequestsAction(params(nextPage, true)));
    setIsLoadingMore(false);
  };

  useEffect(() => {
    refreshLeaveRequests();
  }, [session, currentOrganization.uuid, leaveFilters]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Request Queue
          </h3>
          <Tooltip>
            <TooltipContent>Refresh leave requests</TooltipContent>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"sm"}
                disabled={isLoading}
                onClick={refreshLeaveRequests}
                className={isLoading ? "animate-spin" : ""}
              >
                <RefreshCw size={16} className="text-primary" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>

      {isLeaveTypeLoading || (isLoading && !isLoadingMore) ? (
        <LeaveRequestSkeleton />
      ) : approvableLeaveRequests.rows.length === 0 ? (
        <div className="flex flex-col items-center flex-1 justify-center gap-4 p-2">
          <ClipboardX className="w-20 h-20 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No request found in the queue.
          </p>
        </div>
      ) : (
        <div id="scrollable-leave-request-div" className="overflow-y-auto flex-1">
          <InfiniteScroll
            dataLength={approvableLeaveRequests.rows.length}
            next={fetchMoreLeaveRequests}
            hasMore={
              approvableLeaveRequests.count >
              approvableLeaveRequests.rows.length
            }
            loader={
              isLoadingMore && (
                <div className="p-4 border-b border-border flex gap-2">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-20 rounded-sm" />
                    </div>
                    <Skeleton className="h-3 w-28" />
                    <div className="flex items-center space-x-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              )
            }
            scrollableTarget="scrollable-leave-request-div"
          >
            {approvableLeaveRequests.rows.map((leaveRequest) => {
              return (
                <React.Fragment key={leaveRequest.uuid}>
                  <UserCard leaveRequest={leaveRequest} />
                </React.Fragment>
              );
            })}
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
