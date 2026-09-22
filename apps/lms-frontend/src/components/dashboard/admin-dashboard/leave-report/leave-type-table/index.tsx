import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect, useMemo, useState } from "react";
import { ProvideSlaModal } from "../../../shared/sla-modal";
import DataTable from "@/shared/table";
import { getLeaveTypeColumns, LeaveReportRow } from "../columdef";
import { MonthPicker } from "@/components/ui/month-picker";
import { Period } from "@/lib/period";
import { UserInterface } from "@/features/user/user.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import { getUserLeaveTypeReportAction } from "@/features/leave/get-user-leave-type-report/get-user-leave-type-report.action";

export default function UserLeaveBalance() {
  const dispatch = useAppDispatch();
  const can = usePermissionCheck();
  const { leaveTypes, userLeaveTypeReport } = useAppSelector(
    (state) => state.leaveSlice,
  );
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);

  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10 });
  const [leaveReportMonth, setLeaveReportMonth] = useState<string>(
    Period.getCurrentPeriod(),
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setUserPagination((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      getUserLeaveTypeReportAction({
        org_uuid,
        pagination: { ...userPagination, search },
        month: leaveReportMonth,
      }),
    ).finally(() => setIsLoading(false));
  }, [userPagination, search, leaveReportMonth, org_uuid]);

  useEffect(() => {
    if (can(PermissionTag.LEAVE_TYPE_MANAGEMENT, PermissionAction.READ)) {
      dispatch(listLeaveTypesAction({ org_uuid, is_filter: "false" }));
    }
  }, [can, org_uuid, leaveReportMonth]);

  const leaveData = useMemo<LeaveReportRow[]>(() => {
    if (!userLeaveTypeReport?.users?.length || !leaveTypes?.length) return [];
    return userLeaveTypeReport.users.map((user) => {
      const row: LeaveReportRow = { ...user };

      // initialize all leave type columns
      leaveTypes.forEach((leaveType) => {
        row[leaveType.code] = null;
      });

      // populate balances
      user.leave_balances?.forEach((balance) => {
        row[balance.leave_type.code] = balance;
      });

      return row;
    });
  }, [userLeaveTypeReport, leaveTypes, leaveReportMonth]);

  const onClose = () => {
    setSelectedUser(null);
  };

  const handleResolve = async () => {
    dispatch(
      getUserLeaveTypeReportAction({
        org_uuid,
        pagination: { ...userPagination, search },
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
        hasPermission={can(
          PermissionTag.LEAVE_TYPE_MANAGEMENT,
          PermissionAction.READ,
        ) && can(
          PermissionTag.LEAVE_REPORT_MANAGEMENT,
          PermissionAction.READ,
        )}
        moduleName="Leave Type Report"
        data={leaveData}
        columns={getLeaveTypeColumns(leaveTypes, setSelectedUser)}
        isLoading={isLoading}
        totalCount={userLeaveTypeReport?.count || 0}
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
