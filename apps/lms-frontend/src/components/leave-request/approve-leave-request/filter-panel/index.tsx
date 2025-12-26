"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import { ClipboardX, Funnel, FunnelX } from "lucide-react";
import React, { useEffect } from "react";
import { DateRangePicker } from "@/shared/date-range-picker";
import { useAppDispatch, useAppSelector } from "@/store";
import { getLeaveTypesAction } from "@/features/leave-types/leave-types.action";
import { FilterPanelSkeleton } from "./skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { setLeaveFilters } from "@/features/leave-requests/leave-requests.slice";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchSelect } from "@/shared/select/search-select";
import { listUserAction } from "@/features/user/user.action";
import { resetUsers } from "@/features/user/user.slice";

const LeaveRequestFilters = () => {
  const {
    users,
    currentUser,
    currentPage,
    isLoading: isUsersLoading,
    total: userTotal,
  } = useAppSelector((s) => s.userSlice);
  const { currentOrganization } = useAppSelector((s) => s.organizationsSlice);
  const { leaveTypes, isLoading } = useAppSelector((s) => s.leaveTypeSlice);
  const { leaveFilters } = useAppSelector((s) => s.leaveRequestSlice);
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
        setLeaveFilters({
          ...leaveFilters,
          date_range: [start_date, end_date],
          date: undefined,
        })
      );
    } else if (start_date || end_date) {
      dispatch(
        setLeaveFilters({
          ...leaveFilters,
          date: start_date || end_date,
          date_range: undefined,
        })
      );
    } else {
      dispatch(
        setLeaveFilters({
          ...leaveFilters,
          date: undefined,
          date_range: undefined,
        })
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
        })
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
      })
    );
  };

  useEffect(() => {
    dispatch(getLeaveTypesAction({ org_uuid: currentOrganization.uuid }));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <Funnel className="w-4 h-4" />
          <p className="text-sm font-semibold">Filters</p>
        </div>
        <div className="mt-4">
          <SearchSelect
            value={leaveFilters?.user_uuid || ""}
            onValueChange={(value) =>
              dispatch(setLeaveFilters({ ...leaveFilters, user_uuid: value }))
            }
            searchValue={userSearch}
            onSearchChange={setUserSearch}
            onLoadMore={handleLoadMoreUsers}
            data={users.filter(user => user.user_id !== currentUser?.user_id) ?? []}
            placeholder="Select employee"
            isLoading={isUsersLoading}
            hasMore={users.length < userTotal}
            emptyMessage="No employee found."
            displayKey="name"
            valueKey="user_id"
          />
        </div>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="overflow-y-auto p-4 flex-1">
        <div className="mb-4">
          <div className="flex-1 flex justify-between items-center mb-3">
            <p className="text-sm font-semibold tracking-wider">STATUS</p>
            <Tooltip>
              <TooltipContent>Clear status filters</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  size={"icon-sm"}
                  variant={"ghost"}
                  disabled={leaveFilters?.status === undefined}
                  onClick={() =>
                    dispatch(
                      setLeaveFilters({ ...leaveFilters, status: undefined })
                    )
                  }
                >
                  <FunnelX size={14} className="text-orange-500" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
          <div className="space-y-2">
            <RadioGroup
              value={leaveFilters?.status || ""}
              onValueChange={(value) =>
                dispatch(setLeaveFilters({ ...leaveFilters, status: value }))
              }
            >
              {Object.entries(LeaveRequestStatus).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <RadioGroupItem
                    value={key}
                    id={`status-${key}`}
                    className="cursor-pointer text-orange-500 [&_svg]:fill-orange-500 focus-visible:ring-orange-500"
                  />
                  <Label
                    htmlFor={`status-${key}`}
                    className="text-sm group-hover:text-orange-400 transition-colors duration-200 flex-1 cursor-pointer"
                  >
                    {value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex-1 flex justify-between items-center mb-3">
            <p className="text-sm font-semibold tracking-wider">LEAVE TYPE</p>
            <Tooltip>
              <TooltipContent>Clear leave type filters</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  size={"icon-sm"}
                  variant={"ghost"}
                  disabled={leaveFilters?.leave_type_uuid === undefined}
                  onClick={() =>
                    dispatch(
                      setLeaveFilters({
                        ...leaveFilters,
                        leave_type_uuid: undefined,
                      })
                    )
                  }
                >
                  <FunnelX size={14} className="text-orange-500" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
          {isLoading ? (
            <FilterPanelSkeleton />
          ) : leaveTypes.total === 0 ? (
            <div className="flex items-center">
              <ClipboardX className="w-4 h-4 mr-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No leave types available
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <RadioGroup
                value={leaveFilters?.leave_type_uuid || ""}
                onValueChange={(value) =>
                  dispatch(
                    setLeaveFilters({ ...leaveFilters, leave_type_uuid: value })
                  )
                }
              >
                {leaveTypes.rows.map((leaveType) => (
                  <div
                    key={leaveType.uuid}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <RadioGroupItem
                      value={leaveType.uuid}
                      id={`leave-type-${leaveType.uuid}`}
                      className="cursor-pointer text-orange-500 [&_svg]:fill-orange-500 focus-visible:ring-orange-500"
                    />
                    <Label
                      htmlFor={`leave-type-${leaveType.uuid}`}
                      className="text-sm group-hover:text-orange-400 transition-colors duration-200 flex-1 cursor-pointer"
                    >
                      {leaveType.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold tracking-wider mb-3">
            DATE RANGE
          </p>
          <div>
            <DateRangePicker
              isDependant={false}
              setDateRange={setDateRangeFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestFilters;
