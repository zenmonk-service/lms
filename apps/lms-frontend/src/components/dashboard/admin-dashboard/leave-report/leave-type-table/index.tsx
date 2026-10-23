"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { useAppDispatch, useAppSelector } from "@/store";
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

  const orgUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);

  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [leaveReportMonth, setLeaveReportMonth] = useState(
    Period.getCurrentPeriod(),
  );

  const canReadLeaveTypes = can(
    PermissionTag.LEAVE_TYPE_MANAGEMENT,
    PermissionAction.READ,
  );

  const canReadLeaveReport = can(
    PermissionTag.LEAVE_REPORT_MANAGEMENT,
    PermissionAction.READ,
  );

  const canAdjustLeave = can(
    PermissionTag.LEAVE_TYPE_MANAGEMENT,
    PermissionAction.SLA,
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setUserPagination((prev) =>
      prev.page === 1 ? prev : { ...prev, page: 1 },
    );
  }, []);

  useEffect(() => {
    if (!orgUuid) return;

    let cancelled = false;

    setIsLoading(true);

    dispatch(
      getUserLeaveTypeReportAction({
        org_uuid: orgUuid,
        pagination: {
          page: userPagination.page,
          limit: userPagination.limit,
          search,
        },
        month: leaveReportMonth,
      }),
    ).finally(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    dispatch,
    orgUuid,
    userPagination.page,
    userPagination.limit,
    search,
    leaveReportMonth,
  ]);

  // Leave types depend on the organization and permission, not the month.
  useEffect(() => {
    if (!orgUuid || !canReadLeaveTypes) return;

    dispatch(
      listLeaveTypesAction({
        org_uuid: orgUuid,
        is_filter: "false",
      }),
    );
  }, [dispatch, orgUuid, canReadLeaveTypes]);

  const leaveData = useMemo<LeaveReportRow[]>(() => {
    const users = userLeaveTypeReport?.users ?? [];
    const types = leaveTypes ?? [];

    if (users.length === 0) return [];

    return users.map((user) => {
      const row: LeaveReportRow = { ...user };

      types.forEach((leaveType) => {
        row[leaveType.code] = null;
      });

      user.leave_balances?.forEach((balance) => {
        row[balance.leave_type.code] = balance;
      });

      return row;
    });
  }, [userLeaveTypeReport?.users, leaveTypes]);

  const handleClose = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const handleResolve = useCallback(async () => {
    if (!orgUuid) return;

    await dispatch(
      getUserLeaveTypeReportAction({
        org_uuid: orgUuid,
        pagination: {
          page: userPagination.page,
          limit: userPagination.limit,
          search,
        },
        month: leaveReportMonth,
      }),
    );
  }, [
    dispatch,
    orgUuid,
    userPagination.page,
    userPagination.limit,
    search,
    leaveReportMonth,
  ]);
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  const columns = useMemo(
    () =>
      getLeaveTypeColumns(leaveTypes ?? [], setSelectedUser, canAdjustLeave ,tableContainerRef),
    [leaveTypes, canAdjustLeave ,tableContainerRef],
  );

  const handlePaginationChange = useCallback(
    (state: { page?: number; limit?: number }) => {
      setUserPagination((prev) => {
        const next = {
          page: state.page ?? prev.page,
          limit: state.limit ?? prev.limit,
        };

        if (prev.page === next.page && prev.limit === next.limit) {
          return prev;
        }

        return next;
      });
    },
    [],
  );
  return (
    <>
      <ProvideSlaModal
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
        onClose={handleClose}
        onResolve={handleResolve}
        selectedUserUuid={selectedUser?.user_id ?? ""}
        period={leaveReportMonth}
      />

      <DataTable
        hasPermission={canReadLeaveTypes && canReadLeaveReport}
        moduleName="Leave Type Report"
        data={leaveData}
        columns={columns}
        isLoading={isLoading}
        totalCount={userLeaveTypeReport?.count ?? 0}
        showPagination={true}
        pagination={userPagination}
        searchValue={search}
        onSearchChange={handleSearchChange}
        onPaginationChange={handlePaginationChange}
        tableContainerRef={tableContainerRef}
      >
        <MonthPicker value={leaveReportMonth} onChange={setLeaveReportMonth} />
      </DataTable>
    </>
  );
}
