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
import { LeaveRequest, Row } from "@/features/leave/leave.types";
import AdditionalFilters from "./components/additional-filters";
import { setLeaveRequestFilter } from "@/features/leave/leave.slice";
import ListRequestAccordion from "./components/list-request-accordion";
import { LeaveBalanceCarouselSkeleton } from "./components/leave-balance-carousel/components/skeleton";
import { useEffect, useMemo, useState } from "react";
import { LeaveRequestAccordionSkeleton } from "./components/list-request-accordion/skeleton";
import { listUserLeaveBalancesAction } from "@/features/leave/list-user-leave-balance/list-user-leave-balance.action";
import CustomSelect from "@/shared/select";
import LeaveBalanceCarousel from "./components/leave-balance-carousel";
import { Period } from "@/lib/period";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";

interface IProps {
  isLoading: boolean;
  isLoadingMore: boolean;
  userLeaveRequests: LeaveRequest;
  isView?: boolean;
  onDelete?: (leaveRequestUuid: string) => void;
  onEdit?: (leaveRequest: Row) => void;
  userUUId?: string;
}

export default function UserLeaveRequest({
  isLoading,
  isLoadingMore,
  userLeaveRequests,
  isView = false,
  userUUId,
  onDelete,
  onEdit,
}: IProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { userLeaveBalances: leaveBalances, leaveBalancesLoading } = useAppSelector((state) => state.leaveSlice);
  const currentOrganizationUuid = useAppSelector((state) => state.organizationsSlice.currentOrganization?.uuid);
  const can = usePermissionCheck();
  const canReadLeaveBalances = can(PermissionTag.LEAVE_TYPE_MANAGEMENT, PermissionAction.READ);
  const [selectedPeriod, setSelectedPeriod] = useState(Period.getCurrentPeriod());

  // Generate last 12 months
  const monthOptions = useMemo(() => {
    const months = [];

    for (let i = 0; i < 12; i++) {
      const value = Period.getPeriodMonthsAgo(i);

      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      months.push({
        value,
        label,
      });
    }

    return months;
  }, []);

  useEffect(() => {
    if (!userUUId || !currentOrganizationUuid) return;
    if (!canReadLeaveBalances &&  isView ) return ;
    dispatch(
      listUserLeaveBalancesAction({
        user_uuid: userUUId ?? currentUser.user_id,
        org_uuid: currentOrganizationUuid,
        period: selectedPeriod,
        is_sealed: false,
        is_me:  isView ? "false" : "true",
      }),
    );
  }, [dispatch, currentUser?.user_id, currentOrganizationUuid, selectedPeriod, userUUId]);

  const handleRefresh = () => {
    dispatch(setLeaveRequestFilter({ pagination: { page: 1, limit: 10 } }));
    if (!canReadLeaveBalances &&  isView ) return ;
    if (currentOrganizationUuid) {
      dispatch(
        listUserLeaveBalancesAction({
          user_uuid: userUUId ?? currentUser.user_id,
          org_uuid: currentOrganizationUuid,
          period: selectedPeriod,
          is_sealed: false,
          is_me:  isView ? "false" : "true",
        }),
      );
    }
  };

  const activeLeaveBalances = useMemo(
    () =>
      (leaveBalances ?? []).filter(
        (lb) => lb?.leave_type?.is_active === true,
      ),
    [leaveBalances],
  );

  return (
    <>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <p className="text-xs font-semibold">Leave Balances</p>
        <CustomSelect
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
          data={monthOptions}
          getValue={(item) => item.value}
          getLabel={(item) => item.label}
          label="Months"
          placeholder="Select month"
          className="w-44"
          size="sm"
        />
      </div>
      <div className="pb-2">
        {leaveBalancesLoading ? (
          <LeaveBalanceCarouselSkeleton />
        ) : !canReadLeaveBalances && isView ? (
          <div className="flex flex-col items-center justify-center bg-card p-6 rounded-lg border border-border">
            <NoDataFound title="No Permission" message="You do not have permission to view leave balances." />
          </div>
        ) : activeLeaveBalances.length > 0 ? (
          <LeaveBalanceCarousel leaveBalance={activeLeaveBalances} />
        ) : (
          <div className="flex flex-col items-center justify-center bg-card p-6 rounded-lg border border-border">
            <NoDataFound message="No leave balances for the selected month. Balances show up once leave types are allocated for this period." />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex">
          <Tooltip>
            <TooltipTrigger asChild className="ml-auto border border-border">
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCcw className={`${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Leave Requests</TooltipContent>
          </Tooltip>
        </div>

        <AdditionalFilters />

        {isLoading ? (
          <LeaveRequestAccordionSkeleton />
        ) : userLeaveRequests.rows.length === 0 ? (
          <div className="min-h-[calc(100vh-373px)] flex justify-center items-center flex-col bg-card p-6 rounded-lg border border-border">
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
    </>
  );
}
