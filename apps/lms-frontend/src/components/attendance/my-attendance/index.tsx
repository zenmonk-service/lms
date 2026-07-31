"use client";

import { useAppSelector } from "@/store";
import { hasPermissions } from "@/lib/has-permission";
import NoPermission from "@/shared/no-permission";
import AttendanceTable from "@/components/attendance/shared/components/table";
import { MonthlyStats } from "./components/monthly-stats";
import Title from "@/shared/typography/title";

const MyAttendance = () => {
  const { currentUser } = useAppSelector((s) => s.userSlice);
  const { currentUserRolePermissions } = useAppSelector((s) => s.permissionSlice);
  const { attendances: userAttendance } = useAppSelector((s) => s.attendancesSlice);

  const canRead = hasPermissions(
    "user_attendance_management",
    "read",
    currentUserRolePermissions,
    currentUser.email,
  );

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

      <AttendanceTable maxHeight="calc(100vh - 463px)" />
    </>
  );
};

export default MyAttendance;
