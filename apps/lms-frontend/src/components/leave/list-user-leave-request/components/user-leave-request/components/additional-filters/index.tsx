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
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import CustomSelect from "@/shared/select";
import { useAppDispatch, useAppSelector } from "@/store";
import { Search, SlidersHorizontal } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const AdditionalFilters = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    users,
    total,
    isLoading,
    currentUser,
    currentPage
  } = useAppSelector((state) => state.userSlice);
  const { leaveRequestFilter } = useAppSelector((state) => state.leaveSlice);
  const { leaveTypes } = useAppSelector((state) => state.leaveTypeSlice);
  const currentOrganizationUuid = useAppSelector((state) => state.organizationsSlice.currentOrganization?.uuid);

  const dispatch = useAppDispatch();

  async function fetchUsers() {
    await dispatch(
      listUserAction({
        pagination: { page: 1, limit: 10, search: searchTerm },
        org_uuid: currentOrganizationUuid,
      }),
    );
  }

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const handleDateRangeFilterChange: Dispatch<
    SetStateAction<{ start_date?: string; end_date?: string }>
  > = (nextDateRange) => {
    if (typeof nextDateRange === "function") return;

    const { start_date, end_date } = nextDateRange;
    dispatch(
      setLeaveRequestFilter({
        date_range: start_date && end_date ? [start_date, end_date] : undefined,
        date: start_date && !end_date ? start_date : undefined,
      }),
    );
  };

  return (
    <div className="flex flex-col bg-card p-4 rounded-md border border-border gap-3">
      <div className="flex items-center gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="Search your leave requests by reason..."
            onChange={(e) =>
              dispatch(
                setLeaveRequestFilter({
                  pagination: {
                    ...leaveRequestFilter?.pagination!,
                    search: e.target.value,
                  },
                }),
              )
            }
            value={leaveRequestFilter?.pagination?.search || ""}
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
          Advanced Filters
        </Button>
      </div>

      <div className={`flex flex-wrap gap-3 ${open ? "" : "hidden"}`}>
        <div className="flex flex-col gap-2">
          <Label>Leave Category</Label>
          <CustomSelect
            value={leaveRequestFilter?.leave_type_uuid || ""}
            onValueChange={(value) => dispatch(setLeaveRequestFilter({ leave_type_uuid: value }))}
            data={leaveTypes.rows}
            getValue={(item) => item.uuid}
            getLabel={(item) => item.name}
            label="Leave Type"
            placeholder="Select leave category"
            className="w-full"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <Label>Managers</Label>
          <InfiniteMultiSelect 
            value={leaveRequestFilter?.managers || []}
            onValuesChange={(managers) => dispatch(setLeaveRequestFilter({ managers: managers.length > 0 ? managers : undefined}))}
            data={users.filter((user) => user.user_id !== currentUser.user_id)}
            total={total}
            isLoading={isLoading}
            onSearch={setSearchTerm}
            onLoadMore={async () =>
              await dispatch(
                listUserAction({
                  pagination: {
                    page: currentPage + 1,
                    limit: 10,
                    search: searchTerm,
                  },
                  org_uuid: currentOrganizationUuid,
                  isInfiniteScroll: true,
                }),
              )
            }
            placeholder="Select managers"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Request Status</Label>
          <CustomSelect
            value={leaveRequestFilter?.status || ""}
            onValueChange={(value) => dispatch(setLeaveRequestFilter({ status: (value as LeaveRequestStatus) }))}
            data={Object.values(LeaveRequestStatus)}
            getValue={(item) => item}
            getLabel={(item) => item}
            label="Leave Status"
            placeholder="Select leave status"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Scheduled Date</Label>
          <DateRangePicker
            setDateRange={handleDateRangeFilterChange}
            isDependant={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalFilters;
