"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ClipboardX, Funnel, FunnelX } from "lucide-react";
import React, { useEffect } from "react";
import { DateRangePicker } from "@/shared/date-range-picker";
import { useAppDispatch, useAppSelector } from "@/store";
import { FilterPanelSkeleton } from "./skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { setLeaveRequestFilter } from "@/features/leave/leave.slice";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfiniteSingleSelect } from "@/shared/infinite-single-select";
import { useInfiniteUserList } from "@/shared/hooks/use-infinite-user-list";
import { UserInterface } from "@/features/user/user.slice";
import { LeaveRequestStatus } from "@/features/leave/leave.types";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";

const LeaveRequestFilters = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((s) => s.userSlice);
  const { currentOrganization } = useAppSelector((s) => s.organizationsSlice);
  const { leaveRequestFilter, leaveTypes, leaveTypesLoading } = useAppSelector((s) => s.leaveSlice);

  const {
    users,
    isLoading: isUsersLoading,
    onSearch: setUserSearch,
    onLoadMore: loadMoreUsers,
    count,
  } = useInfiniteUserList();

  const [selectedEmployee, setSelectedEmployee] = useState<UserInterface | undefined>(
    users.find((u) => u.user_id === leaveRequestFilter?.user_uuid),
  );

  const employeeOptions = useMemo(() => {
    const base = users.filter((u) => u.user_id !== currentUser?.user_id);

    if (
      selectedEmployee &&
      !base.some((u) => u.user_id === selectedEmployee.user_id)
    ) {
      return [...base, selectedEmployee];
    }

    return base;
  }, [users, currentUser, selectedEmployee]);

  const [dateRangeFilter, setDateRangeFilter] = React.useState<{
    start_date?: string;
    end_date?: string;
  }>(() => ({
    start_date: leaveRequestFilter?.date_range?.start_date ?? leaveRequestFilter?.date,
    end_date: leaveRequestFilter?.date_range?.end_date,
  }));

  useEffect(() => {
    const { start_date, end_date } = dateRangeFilter;

    let next: { date?: string; date_range?: { start_date: string; end_date: string } };

    if (start_date && end_date) {
      next = { date_range: { start_date, end_date } };
    } else if (start_date || end_date) {
      next = { date: start_date || end_date };
    } else {
      next = {};
    }

    const dateChanged = leaveRequestFilter?.date !== next.date;
    const rangeChanged =
      JSON.stringify(leaveRequestFilter?.date_range) !== JSON.stringify(next.date_range);

    if (!dateChanged && !rangeChanged) return;

    dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, date: next.date, date_range: next.date_range }));
  }, [dateRangeFilter]);

  useEffect(() => {
    dispatch(listLeaveTypesAction({ org_uuid: currentOrganization.uuid }));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 shrink-0 bg-primary/10">
        <div className="flex gap-2 items-center">
          <Funnel className="w-4 h-4" />
          <p className="text-sm font-semibold">Filters</p>
        </div>
        <div className="mt-4">
          <InfiniteSingleSelect
            value={selectedEmployee}
            onValueChange={(user) => {
              setSelectedEmployee(user);
              dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, user_uuid: user?.user_id }));
            }}
            data={employeeOptions}
            total={count - 1}
            isLoading={isUsersLoading}
            onSearch={setUserSearch}
            onLoadMore={loadMoreUsers}
            getValue={(u) => u.user_id}
            getLabel={(u) => `${u.name} (${u.email})`}
            placeholder="Select employee"
            className="w-full"
            clearable
          />
        </div>
      </div>

      <Separator className="shrink-0" />

      <div className="overflow-y-auto px-4 py-2 flex-1 space-y-4">
        <div className="space-y-2">
          <div className="flex-1 flex justify-between items-end">
            <p className="text-sm font-semibold">Status</p>
            <Tooltip>
              <TooltipContent>Clear status filters</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  size={"icon-sm"}
                  variant={"ghost"}
                  disabled={leaveRequestFilter?.status === undefined}
                  onClick={() =>
                    dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, status: undefined }))
                  }
                >
                  <FunnelX size={14} className="text-primary" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
          <Separator />
          <RadioGroup
            value={leaveRequestFilter?.status || ""}
            onValueChange={(value) =>
              dispatch(
                setLeaveRequestFilter({ ...leaveRequestFilter, status: value as LeaveRequestStatus }),
              )
            }
          >
            {Object.entries(LeaveRequestStatus).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 cursor-pointer group">
                <RadioGroupItem
                  value={value}
                  id={`status-${key}`}
                  className="cursor-pointer text-primary [&_svg]:fill-primary focus-visible:ring-primary"
                />
                <Label
                  htmlFor={`status-${key}`}
                  className="text-sm group-hover:text-primary transition-colors duration-200 flex-1 cursor-pointer"
                >
                  {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <div className="flex-1 flex justify-between items-end">
            <p className="text-sm font-semibold">Leave Type</p>
            <Tooltip>
              <TooltipContent>Clear leave type filters</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  size={"icon-sm"}
                  variant={"ghost"}
                  disabled={leaveRequestFilter?.leave_type_uuid === undefined}
                  onClick={() =>
                    dispatch(
                      setLeaveRequestFilter({ ...leaveRequestFilter, leave_type_uuid: undefined }),
                    )
                  }
                >
                  <FunnelX size={14} className="text-primary" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
          <Separator />
          {leaveTypesLoading ? (
            <FilterPanelSkeleton />
          ) : leaveTypes.length === 0 ? (
            <div className="flex items-center">
              <ClipboardX className="w-4 h-4 mr-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No leave types available</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-43.75 overflow-auto">
              <RadioGroup
                value={leaveRequestFilter?.leave_type_uuid || ""}
                onValueChange={(value) =>
                  dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, leave_type_uuid: value }))
                }
              >
                {leaveTypes
                  .filter((lt) => lt.is_active)
                  .map((leaveType) => (
                    <div key={leaveType.uuid} className="flex items-center gap-2 cursor-pointer group">
                      <RadioGroupItem
                        value={leaveType.uuid}
                        id={`leave-type-${leaveType.uuid}`}
                        className="cursor-pointer text-primary [&_svg]:fill-primary focus-visible:ring-primary"
                      />
                      <Label
                        htmlFor={`leave-type-${leaveType.uuid}`}
                        className="text-sm group-hover:text-primary transition-colors duration-200 flex-1 cursor-pointer"
                      >
                        {leaveType.name}
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="space-y-2 mt-auto">
          <p className="text-sm font-semibold">Date Range</p>
          <DateRangePicker
            initialStartDate={leaveRequestFilter?.date_range?.start_date || leaveRequestFilter?.date}
            initialEndDate={leaveRequestFilter?.date_range?.end_date}
            setDateRange={setDateRangeFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestFilters;