"use client";

import { useAppSelector } from "@/store";
import NoPermission from "@/shared/no-permission";
import AttendanceTable from "@/components/attendance/shared/components/table";
import { MonthlyStats } from "./components/monthly-stats";
import Title from "@/shared/typography/title";
import { UserInterface } from "@/features/user/user.type";
import { useState } from "react";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { UserSingleSelect } from "@/shared/user-single-select";

const MyAttendance = () => {
  const { currentUser } = useAppSelector((s) => s.userSlice);
  const { attendances: userAttendance } = useAppSelector((s) => s.attendancesSlice);

  const [selectedEmployee, setSelectedEmployee] = useState<UserInterface>(currentUser);

  const can = usePermissionCheck();

  const canRead = can(PermissionTag.USER_ATTENDANCE_MANAGEMENT, PermissionAction.READ);
  const canFilter = can(PermissionTag.ATTENDANCE_REPORT_MANAGEMENT, PermissionAction.REPORT);

  if (!canRead && !canFilter) {
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

  const onReset = () => setSelectedEmployee(currentUser);

  return (
    <>
      <Title
        title={{ text: canFilter ? "Attendance" : "My Attendance" }}
        description={{
          text: canFilter
            ? "Check Everyone's attendance records and statistics."
            : "Check your attendance records and statistics.",
        }}
      />

      <MonthlyStats
        totalPresent={userAttendance.total_present_current_month}
        totalAbsent={userAttendance.total_absent_current_month}
      />

      <AttendanceTable
        maxHeight="calc(100vh - 463px)"
        user_uuid={selectedEmployee.user_id}
      >
        {canFilter && (
          <UserSingleSelect
            onReset={onReset}
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
          />
        )}
      </AttendanceTable>
    </>
  );
};

export default MyAttendance;
