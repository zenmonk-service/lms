import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect, useMemo, useState } from "react";
import { ProvideSlaModal } from "../sla-modal";
import DataTable from "@/shared/table";
import { getLeaveTypeColumns } from "../columdef";
import { MonthPicker } from "@/components/ui/month-picker";
import dayjs from "dayjs";

export default function UserLeaveBalance() {
      const dispatch = useAppDispatch();
      const { uuid } = useAppSelector(
        (state) => state.organizationsSlice.currentOrganization,
      );
      const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    search: "",
  });
  const { users, total, isLoading } = useAppSelector(
    (state) => state.userSlice,
  );

  const [leaveReportMonth, setLeaveReportMonth] = useState<string>(
    dayjs().format("YYYY-MM"),
  );
  const { leaveTypes } = useAppSelector((state) => state.leaveSlice);

  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    dispatch(
      listUserAction({
        org_uuid: uuid,
        pagination: userPagination,
        month: leaveReportMonth,
      }),
    );
  }, [userPagination, leaveReportMonth, uuid]);
  useEffect(() => {
    dispatch(listLeaveTypesAction({ org_uuid: uuid }));
  }, []);

  const leaveData = useMemo(() => {
    if (!users?.length || !leaveTypes?.rows?.length) return [];

    return users.map((user) => {
      const row: Record<string, any> = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        image: user.image,
      };

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


  return (
    <>
      <ProvideSlaModal
        open={!!selectedUser}
        month={leaveReportMonth}
        onOpenChange={() => setSelectedUser(null)}
        leaveBalance={users
          .filter((user) => user.user_id === selectedUser?.user_id)
          .flatMap((user) => user.leave_balances)}
        setSelectedLeaveBalance={setSelectedUser}
      />
      <DataTable
        data={leaveData}
        columns={getLeaveTypeColumns(leaveTypes.rows, setSelectedUser)}
        isLoading={isLoading}
        totalCount={total}
        showPagination={true}
        pagination={userPagination}
        onPaginationChange={(state) =>
          setUserPagination({ ...userPagination, ...state })
        }
      >
        <MonthPicker value={leaveReportMonth} onChange={setLeaveReportMonth} />
      </DataTable>
    </>
  );
}
