"use client";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchSelect } from "@/shared/select/search-select";
import { resetUsers } from "@/features/user/user.slice";
import { LeaveRequestStatus } from "@/features/leave/leave.types";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { listUserAction } from "@/features/user/list-user/list-user.action";

const LeaveRequestFilters = () => {
  const {
    users,
    currentUser,
    currentPage,
    isLoading: isUsersLoading,
    total: userTotal,
  } = useAppSelector((s) => s.userSlice);
  const { currentOrganization } = useAppSelector((s) => s.organizationsSlice);
  const { leaveRequestFilter, leaveTypes, leaveTypesLoading } = useAppSelector((s) => s.leaveSlice);
  const dispatch = useAppDispatch();

  const [dateRangeFilter, setDateRangeFilter] = React.useState<{
    start_date?: string;
    end_date?: string;
  }>({ start_date: undefined, end_date: undefined });
  const [userSearch, setUserSearch] = React.useState<string>("");

  useEffect(() => {
    const { start_date, end_date } = dateRangeFilter;

    if (start_date && end_date) {
      dispatch(
        setLeaveRequestFilter({
          ...leaveRequestFilter,
          date_range: [start_date, end_date],
          date: undefined,
        }),
      );
    } else if (start_date || end_date) {
      dispatch(
        setLeaveRequestFilter({
          ...leaveRequestFilter,
          date: start_date || end_date,
          date_range: undefined,
        }),
      );
    } else {
      dispatch(
        setLeaveRequestFilter({
          ...leaveRequestFilter,
          date: undefined,
          date_range: undefined,
        }),
      );
    }
  }, [dateRangeFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(resetUsers());

      dispatch(
        listUserAction({
          org_uuid: currentOrganization.uuid,
          pagination: {
            page: 1,
            limit: 10,
            search: userSearch,
          },
          isInfiniteScroll: true,
        }),
      );
    }, 500);

    return () => clearTimeout(handler);
  }, [userSearch]);

  const handleLoadMoreUsers = () => {
    dispatch(
      listUserAction({
        org_uuid: currentOrganization.uuid,
        pagination: {
          page: currentPage + 1,
          limit: 10,
          search: userSearch,
        },
        isInfiniteScroll: true,
      }),
    );
  };

  useEffect(() => {
    dispatch(listLeaveTypesAction({ org_uuid: currentOrganization.uuid }));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 shrink-0">
        <div className="flex gap-2 items-center">
          <Funnel className="w-4 h-4" />
          <p className="text-sm font-semibold">Filters</p>
        </div>
        <div className="mt-4">
          <SearchSelect
            value={leaveRequestFilter?.user_uuid || ""}
            onValueChange={(value) => dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, user_uuid: value }))}
            searchValue={userSearch}
            onSearchChange={setUserSearch}
            onLoadMore={handleLoadMoreUsers}
            data={users.filter((user) => user.user_id !== currentUser?.user_id) ?? []}
            placeholder="Select employee"
            isLoading={isUsersLoading}
            hasMore={users.length < userTotal}
            emptyMessage="No employee found."
            displayKey="name"
            valueKey="user_id"
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
                  onClick={() => dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, status: undefined }))}
                >
                  <FunnelX size={14} className="text-primary" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
          <Separator />
          <div className="space-y-2">
            <RadioGroup
              value={leaveRequestFilter?.status || ""}
              onValueChange={(value) => dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, status: value as LeaveRequestStatus }))}
            >
              {Object.entries(LeaveRequestStatus).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <RadioGroupItem
                    value={key}
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
                  onClick={() => dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, leave_type_uuid: undefined }))}
                >
                  <FunnelX size={14} className="text-primary" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
          <Separator />
          {leaveTypesLoading ? <FilterPanelSkeleton />
          : leaveTypes.total === 0 ? (
            <div className="flex items-center">
              <ClipboardX className="w-4 h-4 mr-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No leave types available
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-43.75 overflow-auto">
              <RadioGroup
                value={leaveRequestFilter?.leave_type_uuid || ""}
                onValueChange={(value) => dispatch(setLeaveRequestFilter({ ...leaveRequestFilter, leave_type_uuid: value }))}
              >
                {leaveTypes.rows
                  .filter((lt) => lt.is_active)
                  .map((leaveType) => (
                    <div
                      key={leaveType.uuid}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
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

        <div className="space-y-2">
          <p className="text-sm font-semibold">Date Range</p>
          <DateRangePicker
            isDependant={false}
            setDateRange={setDateRangeFilter}
            containerClassName="md:grid-cols-1"
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestFilters;
