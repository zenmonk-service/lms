"use client";

import NoDataFound from "@/shared/no-data-found";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/store";
import { LeaveRequest } from "@/features/leave/leave.types";
import AdditionalFilters from "./components/additional-filters";
import { setLeaveRequestFilter } from "@/features/leave/leave.slice";
import ListRequestAccordion from "./components/list-request-accordion";
import { LeaveBalanceCarouselSkeleton } from "./components/leave-balance-carousel/skeleton";
import { getBadge } from "@/utils/get-badge";
import LeaveBalanceCarousel from "./components/leave-balance-carousel";
import { useEffect } from "react";
import { getUserLeaveBalancesAction } from "@/features/leave-types/leave-types.action";
import LeaveRequestSkeleton from "../../../approve-leave-request/components/leave-requests/skeleton";

interface IProps {
  isLoading: boolean;
  isLoadingMore: boolean;
  userLeaveRequests: LeaveRequest;
  isView?: boolean;
  onDelete?: (leaveRequestUuid: string) => void;
  onEdit?: (leaveRequest: any) => void;
}

export default function UserLeaveRequest({
  isLoading,
  isLoadingMore,
  userLeaveRequests,
  isView = false,
  onDelete,
  onEdit,
}: IProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const currentOrganizationUuid = useAppSelector((state) => state.organizationsSlice.currentOrganization?.uuid);
  const { userLeaveBalances: leaveBalances, isLoading: isLeaveBalancesLoading } = useAppSelector((state) => state.leaveTypeSlice);

  const currentPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    dispatch(
      getUserLeaveBalancesAction({
        user_uuid: currentUser?.user_id,
        org_uuid: currentOrganizationUuid,
        period: currentPeriod,
      }),
    );
  }, []);

  return (
    <div>
      {isLeaveBalancesLoading ? (
        <LeaveBalanceCarouselSkeleton />
      ) : (
        leaveBalances.length > 0 && (
          <div className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold">Leave Balances</p>
              {getBadge("default", String(currentPeriod))}
            </div>
            <LeaveBalanceCarousel leaveBalance={leaveBalances} />
          </div>
        )
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold">Your Leave History</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={() =>
                  dispatch(
                    setLeaveRequestFilter({
                      pagination: { page: 1, limit: 10 },
                    }),
                  )
                }
                disabled={isLoading}
              >
                <RefreshCcw className={`${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Leave History</TooltipContent>
          </Tooltip>
        </div>

        <AdditionalFilters />

        {isLoading ? (
          <LeaveRequestSkeleton />
        ) : userLeaveRequests.rows.length === 0 ? (
          <div className="min-h-[calc(100vh-300px)] flex justify-center items-center flex-col bg-card p-6 rounded-lg border border-border">
            <NoDataFound message="Your leave dashboard is currently empty. Start by submitting your first request to track approvals and manager feedback." />
          </div>
        ) : (
          <ListRequestAccordion
            userLeaveRequests={userLeaveRequests}
            isLoadingMore={isLoadingMore}
            onEdit={onEdit}
            onDelete={onDelete}
            isView={isView}
          />
        )}
      </div>
    </div>
  );
}
