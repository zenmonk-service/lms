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
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { DateRangePicker } from "@/shared/date-range-picker";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import CustomSelect from "@/shared/select";
import { useAppDispatch, useAppSelector } from "@/store";
import { Search, SlidersHorizontal } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Collapse from "@/shared/motion/collapse";

const AdditionalFilters = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [searchUserTerm, setSearchUserTerm] = useState<string>("");
  const [searchLeaveTerm, setSearchLeaveTerm] = useState<string>("");

  const debouncedSearchLeaveTerm = useDebounce(searchLeaveTerm, 500);

  const { users, total, isLoading, currentUser, currentPage } = useAppSelector((state) => state.userSlice);
  const { leaveRequestFilter, leaveTypes } = useAppSelector((state) => state.leaveSlice);
  const currentOrganizationUuid = useAppSelector((state) => state.organizationsSlice.currentOrganization?.uuid);

  const dispatch = useAppDispatch();

  async function fetchUsers() {
    await dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchUserTerm },
        org_uuid: currentOrganizationUuid,
      }),
    );
  }

  useEffect(() => {
    dispatch(
      setLeaveRequestFilter({
        pagination: {
          page: 1,
          limit: 10,
          search: debouncedSearchLeaveTerm,
        },
      }),
    );
  }, [debouncedSearchLeaveTerm, currentOrganizationUuid]);

  useEffect(() => {
    fetchUsers();
  }, [searchUserTerm, currentOrganizationUuid]);

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
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <div className="flex flex-col gap-2">
            <Label>Leave Category</Label>
            <CustomSelect
              value={leaveRequestFilter?.leave_type_uuid || ""}
              onValueChange={(value) =>
                dispatch(setLeaveRequestFilter({ leave_type_uuid: value }))
              }
              data={leaveTypes.rows}
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

          <div className="flex flex-col gap-2 col-span-2 sm:col-auto">
            <Label>Managers</Label>
            <InfiniteMultiSelect
              value={leaveRequestFilter?.managers || []}
              onValuesChange={(managers) =>
                dispatch(
                  setLeaveRequestFilter({
                    managers: managers.length > 0 ? managers : undefined,
                  }),
                )
              }
              data={users.filter(
                (user) => user.user_id !== currentUser.user_id,
              )}
              total={total}
              isLoading={isLoading}
              onSearch={setSearchUserTerm}
              onLoadMore={async () =>
                await dispatch(
                  listUserAction({
                    pagination: {
                      page: currentPage + 1,
                      limit: 10,
                      search: searchUserTerm,
                    },
                    org_uuid: currentOrganizationUuid,
                    isInfiniteScroll: true,
                  }),
                )
              }
              placeholder="Select managers"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2 col-span-2">
            <Label>Scheduled Date</Label>
            <DateRangePicker
              setDateRange={handleDateRangeFilterChange}
              isDependant={false}
            />
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default AdditionalFilters;
