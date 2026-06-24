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
import { LeaveBalanceCarouselSkeleton } from "./components/leave-balance-carousel/components/skeleton";
import LeaveBalanceCarousel from "./components/leave-balance-carousel";
import { useEffect, useMemo, useState } from "react";
import { LeaveRequestAccordionSkeleton } from "./components/list-request-accordion/skeleton";
import { listUserLeaveBalancesAction } from "@/features/leave/list-user-leave-balance/list-user-leave-balance.action";
import { Label } from "recharts";
import CustomSelect from "@/shared/select";

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
  const currentOrganizationUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const { userLeaveBalances: leaveBalances, leaveBalancesLoading } =
    useAppSelector((state) => state.leaveSlice);

  const currentDate = new Date();
  const defaultPeriod = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);

  // Generate last 12 months
  const monthOptions = useMemo(() => {
    const months = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

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
    if (!currentUser?.user_id || !currentOrganizationUuid) return;

    dispatch(
      listUserLeaveBalancesAction({
        user_uuid: currentUser.user_id,
        org_uuid: currentOrganizationUuid,
        period: selectedPeriod,
      }),
    );
  }, [dispatch, currentUser?.user_id, currentOrganizationUuid, selectedPeriod]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold">Leave Balances</p>
        <div className="flex flex-col gap-2">
          <Label>Request Status</Label>
          <CustomSelect
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            data={monthOptions}
            getValue={(item) => item.value}
            getLabel={(item) => item.label}
            label="Months"
            placeholder="Select month"
            className="w-full"
          />
        </div>
      </div>
      {leaveBalancesLoading ? (
        <LeaveBalanceCarouselSkeleton />
      ) : (
        leaveBalances.length > 0 && (
          <div className="pb-2">
            <LeaveBalanceCarousel leaveBalance={leaveBalances} />
          </div>
        )
      )}
      <div className="space-y-2">
        <div className="flex">
          <Tooltip>
            <TooltipTrigger asChild className="ml-auto border border-border">
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
            <TooltipContent>Refresh Leave Requests</TooltipContent>
          </Tooltip>
        </div>

        <AdditionalFilters />

        {isLoading ? (
          <LeaveRequestAccordionSkeleton />
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
