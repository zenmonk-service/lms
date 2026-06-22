import { Plane } from "lucide-react";
import { DashboardStatCard } from "./dashboard-stat-card";

interface IProps {}

export function DashboardStatsGrid({}: IProps) {
  return (
    <div className="flex-1 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <DashboardStatCard
        label="On leave days"
        value={1}
        icon={Plane}
        iconClassName="h-4 w-4 text-chart-3"
      />
      <DashboardStatCard
        label="On leave days"
        value={2}
        icon={Plane}
        iconClassName="h-4 w-4 text-chart-3"
      />
      <DashboardStatCard
        label="On leave days"
        value={3}
        icon={Plane}
        iconClassName="h-4 w-4 text-chart-3"
      />
    </div>
  );
}
