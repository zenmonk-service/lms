"use client";

import { useAppSelector } from "@/store";
import NoPermission from "@/shared/no-permission";
import AttendanceTable from "@/components/attendance/shared/components/table";
import { MonthlyStats } from "./components/monthly-stats";
import Title from "@/shared/typography/title";
import { UserInterface } from "@/features/user/user.type";
import { useState } from "react";
import ListUserInfiniteScroll from "@/shared/list-user-infinite-scroll";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";

const MyAttendance = () => {
  const { currentUser } = useAppSelector((s) => s.userSlice);
  const { attendances: userAttendance } = useAppSelector((s) => s.attendancesSlice);

  const [selectedEmployee, setSelectedEmployee] = useState<UserInterface>(currentUser);

  const can = usePermissionCheck();

  const canRead = can(PermissionTag.USER_ATTENDANCE_MANAGEMENT, PermissionAction.READ);
  const canFilter = can(PermissionTag.ATTENDANCE_MANAGEMENT, PermissionAction.READ);

  if (!canRead) {
    return (
      <div className="flex h-[calc(100vh-49px)] max-h-[calc(100vh-49px)] overflow-hidden font-sans">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex p-6 w-full">
            <NoPermission moduleName="Attendance" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Title
        title={{ text: "My Attendance" }}
        description={{ text: "Check your attendance records and statistics." }}
      />

      <MonthlyStats
        totalPresent={userAttendance.total_present_current_month}
        totalAbsent={userAttendance.total_absent_current_month}
      />

      <AttendanceTable maxHeight="calc(100vh - 463px)" user_uuid={selectedEmployee.user_id}>
        {canFilter && <ListUserInfiniteScroll selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} />}
      </AttendanceTable>
    </>
  );
};

export default MyAttendance;
