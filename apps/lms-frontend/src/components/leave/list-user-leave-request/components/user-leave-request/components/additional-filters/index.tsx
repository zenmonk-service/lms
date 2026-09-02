"use client";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { setLeaveRequestFilter } from "@/features/leave/leave.slice";
import { LeaveRequestStatus } from "@/features/leave/leave.types";
import { DateRangePicker } from "@/shared/date-range-picker";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useInfiniteUserList } from "@/shared/hooks/use-infinite-user-list";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import CustomSelect from "@/shared/select";
import { useAppDispatch, useAppSelector } from "@/store";
import { Search, SlidersHorizontal } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import Collapse from "@/shared/motion/collapse";

const AdditionalFilters = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [searchLeaveTerm, setSearchLeaveTerm] = useState<string>("");
  const debouncedSearchLeaveTerm = useDebounce(searchLeaveTerm, 500);

  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { leaveRequestFilter, leaveTypes } = useAppSelector((state) => state.leaveSlice);
  const currentOrganizationUuid = useAppSelector((state) => state.organizationsSlice.currentOrganization?.uuid);

  const dispatch = useAppDispatch();

  const {
    users,
    total,
    count,
    isLoading: isUsersLoading,
    isLoadingMore: isUsersLoadingMore,
    onSearch: setSearchUserTerm,
    onLoadMore: loadMoreUsers,
  } = useInfiniteUserList();

  const managerOptions = useMemo(
    () => users.filter((user) => user.user_id !== currentUser.user_id),
    [users, currentUser.user_id],
  );

  useEffect(() => {
    dispatch(
      setLeaveRequestFilter({
        pagination: { page: 1, limit: 10, search: debouncedSearchLeaveTerm },
      }),
    );
  }, [debouncedSearchLeaveTerm, currentOrganizationUuid, dispatch]);

  const handleDateRangeFilterChange: Dispatch<
    SetStateAction<{ start_date?: string; end_date?: string }>
  > = (nextDateRange) => {
    if (typeof nextDateRange === "function") return;

    const { start_date, end_date } = nextDateRange;
    dispatch(
      setLeaveRequestFilter({
        date_range:
          start_date && end_date ? { start_date, end_date } : undefined,
        date: start_date && !end_date ? start_date : undefined,
      }),
    );
  };

  return (
    <div className="flex flex-col bg-card p-4 rounded-md border border-border">
      <div className="flex items-center gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="Search your leave requests by reason..."
            onChange={(e) => setSearchLeaveTerm(e.target.value)}
            value={searchLeaveTerm || ""}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setOpen(!open)}
        >
          <SlidersHorizontal />
          <span className="hidden sm:block">Advanced Filters</span>
        </Button>
      </div>

      <Collapse open={open}>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="flex flex-col gap-2">
            <Label>Leave Category</Label>
            <CustomSelect
              value={leaveRequestFilter?.leave_type_uuid || ""}
              onValueChange={(value) =>
                dispatch(setLeaveRequestFilter({ leave_type_uuid: value }))
              }
              data={leaveTypes}
              getValue={(item) => item.uuid}
              getLabel={(item) => item.name}
              label="Leave Type"
              placeholder="Select leave category"
              className="w-full"
              onReset={() =>
                dispatch(setLeaveRequestFilter({ leave_type_uuid: undefined }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Request Status</Label>
            <CustomSelect
              value={leaveRequestFilter?.status || ""}
              onValueChange={(value) =>
                dispatch(
                  setLeaveRequestFilter({
                    status: value as LeaveRequestStatus,
                  }),
                )
              }
              data={Object.values(LeaveRequestStatus)}
              getValue={(item) => item}
              getLabel={(item) => item}
              label="Leave Status"
              placeholder="Select leave status"
              className="w-full"
              onReset={() =>
                dispatch(setLeaveRequestFilter({ status: undefined }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Managers</Label>
            <InfiniteMultiSelect
              value={leaveRequestFilter?.managers || []}
              onValuesChange={(managers) => dispatch(setLeaveRequestFilter({ managers: managers.length > 0 ? managers : undefined }))}
              getValue={(user) => user.user_id}
              getLabel={(user) => user.name}
              data={managerOptions}
              total={count - 1}
              isLoading={isUsersLoading}
              isLoadingMore={isUsersLoadingMore}
              onSearch={setSearchUserTerm}
              onLoadMore={loadMoreUsers}
              placeholder="Select managers"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Scheduled Date</Label>
            <DateRangePicker setDateRange={handleDateRangeFilterChange} />
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default AdditionalFilters;
