import { CalendarDays, Plane, UserCheck, UserMinus } from "lucide-react";
import { AttendanceSummary } from "../../dashboard.types";
import { DashboardStatCard } from "./components/dashboard-stat-card";

interface IProps {
  attendanceSummary: AttendanceSummary;
  leaveRequestsCount: number;
}

export function DashboardStatsGrid({
  attendanceSummary,
  leaveRequestsCount,
}: IProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        label="Present days"
        value={attendanceSummary.present}
        icon={UserCheck}
        iconClassName="h-4 w-4 text-chart-1"
      />
      <DashboardStatCard
        label="Absent days"
        value={attendanceSummary.absent}
        icon={UserMinus}
        iconClassName="h-4 w-4 text-chart-2"
      />
      <DashboardStatCard
        label="On leave days"
        value={attendanceSummary.on_leave}
        icon={Plane}
        iconClassName="h-4 w-4 text-chart-3"
      />
      <DashboardStatCard
        label="Leave requests"
        value={leaveRequestsCount}
        icon={CalendarDays}
        iconClassName="h-4 w-4 text-primary"
      />
    </div>
  );
}