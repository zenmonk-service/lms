"use client";
import { MonthPicker } from "@/components/ui/month-picker";
import DataTable from "@/shared/table";
import { useAppDispatch, useAppSelector } from "@/store";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { getLeaveTypeColumns } from "./columdef";
import { ProvideSlaModal } from "./sla-modal";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import LeaveCharts from "./chart";
import { ATTENDANCE_COLORS } from "../../user-dashboard/dashboard.constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRequestFilters from "@/components/leave/approve-leave-request/components/filter-panel";
import LeaveRequests from "@/components/leave/approve-leave-request/components/leave-requests";
import UserLeaveRequestDetails from "@/components/leave/approve-leave-request/components/leave-requests/components/user-leave-request-details";

export default function AdminLeaveDashboard() {
  const dispatch = useAppDispatch();
  const { uuid } = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization,
  );
  const [viewMode, setViewMode] = useState<"Leave Report" | "Leave Requests">(
    "Leave Requests",
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

  const data = [
    {
      color: ATTENDANCE_COLORS.present,
      name: "Approved",
      value: 5,
    },
    {
      color: ATTENDANCE_COLORS.absent,
      name: "Rejected",
      value: 2,
    },
    {
      color: ATTENDANCE_COLORS.late,
      name: "Pending",
      value: 5,
    },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="w-11/12 p-6">
        <LeaveCharts data={data} loading={isLoading} />
        <Tabs
          value={viewMode}
          onValueChange={(value) =>
            setViewMode(value as "Leave Report" | "Leave Requests")
          }
        >
          <TabsList>
            <TabsTrigger value="Leave Requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="Leave Report">Leave Type Report</TabsTrigger>
          </TabsList>
          <TabsContent value="Leave Report">
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
              <MonthPicker
                value={leaveReportMonth}
                onChange={setLeaveReportMonth}
              />
            </DataTable>
          </TabsContent>

          <TabsContent value="Leave Requests">
            <div className="flex h-[calc(100vh-177px)] bg-card rounded-lg border border-border overflow-scroll">
              <div className="w-80 border-r border-border">
                <LeaveRequestFilters />
              </div>
              <div className="w-96 border-r border-border">
                <LeaveRequests isAdmin={true} />
              </div>
              <div className="flex-1">
                <UserLeaveRequestDetails />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
