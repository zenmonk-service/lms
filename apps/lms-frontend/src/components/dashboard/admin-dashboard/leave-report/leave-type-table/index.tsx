import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect, useMemo, useState } from "react";
import { ProvideSlaModal } from "../../../shared/sla-modal";
import DataTable from "@/shared/table";
import { getLeaveTypeColumns, LeaveReportRow } from "../columdef";
import { MonthPicker } from "@/components/ui/month-picker";
import dayjs from "dayjs";
import { UserInterface } from "@/features/user/user.type";

export default function UserLeaveBalance() {
  const dispatch = useAppDispatch();

  const { leaveTypes } = useAppSelector((state) => state.leaveSlice);
  const { users, total } = useAppSelector((state) => state.userSlice);
  const org_uuid = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10 });
  const [leaveReportMonth, setLeaveReportMonth] = useState<string>(dayjs().format("YYYY-MM"));

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setUserPagination((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      listUserAction({
        org_uuid,
        pagination: { ...userPagination, search },
        month: leaveReportMonth,
      }),
    ).finally(() => setIsLoading(false));
  }, [userPagination, search, leaveReportMonth, org_uuid]);

  useEffect(() => { dispatch(listLeaveTypesAction({ org_uuid })); }, []);

  const leaveData = useMemo<LeaveReportRow[]>(() => {
    if (!users?.length || !leaveTypes?.rows?.length) return [];

    return users.map((user) => {
      const row: LeaveReportRow = { ...user };

      // initialize all leave type columns
      leaveTypes.rows.forEach((leaveType) => {
        row[leaveType.code] = null;
      });

      // populate balances
      user.leave_balances?.forEach((balance) => {
        row[balance.leave_type.code] = balance;
      });

      return row;
    });
  }, [users, leaveTypes]);

  const onClose = () => {
    setSelectedUser(null);
  };

  const handleResolve = async () => {
    await dispatch(
      listUserAction({
        org_uuid,
        pagination: { page: 1, limit: 10 },
        month: leaveReportMonth,
      }),
    );
  };

  return (
    <>
      <ProvideSlaModal
        open={!!selectedUser}
        onOpenChange={() => setSelectedUser(null)}
        onClose={onClose}
        onResolve={handleResolve}
        selectedUserUuid={selectedUser?.user_id!}
        period={leaveReportMonth}
      />
      <DataTable
        
        data={leaveData}
        columns={getLeaveTypeColumns(leaveTypes.rows, setSelectedUser)}
        isLoading={isLoading}
        totalCount={total}
        showPagination={true}
        pagination={userPagination}
        searchValue={search}
        onSearchChange={handleSearchChange}
        onPaginationChange={(state) =>
          setUserPagination({ ...userPagination, ...state })
        }
      >
        <MonthPicker value={leaveReportMonth} onChange={setLeaveReportMonth} />
      </DataTable>
    </>
  );
}
