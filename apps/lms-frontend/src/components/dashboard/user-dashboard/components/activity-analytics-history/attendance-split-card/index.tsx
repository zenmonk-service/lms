"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { LoaderCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { CustomPieTooltip } from "./pie-tooltip";
import { useAppSelector } from "@/store";
import { getDateRange } from "@/utils/range-calculator";
import { AttendanceChartDatum } from "../../../dashboard.types";
import { ATTENDANCE_COLORS } from "../../../dashboard.constants";
import { useAttendanceFetch } from "@/components/attendance/my-attendance/hooks/use-attendance-fetch";

interface IProps {
  userUUID: string;
}

const STATUS_META = [
  { key: AttendanceStatus.PRESENT, name: "Present", color: ATTENDANCE_COLORS.present },
  { key: AttendanceStatus.ABSENT, name: "Absent", color: ATTENDANCE_COLORS.absent },
  { key: AttendanceStatus.LATE, name: "Late", color: ATTENDANCE_COLORS.late },
  { key: AttendanceStatus.HALF_DAY, name: "Half Day", color: ATTENDANCE_COLORS.half_day },
  { key: AttendanceStatus.ON_LEAVE, name: "On Leave", color: ATTENDANCE_COLORS.on_leave },
  {
    key: AttendanceStatus.EARLY_DEPARTURE,
    name: "Early Departure",
    color: ATTENDANCE_COLORS.early_departure,
  },
  { key: AttendanceStatus.SHORT_LEAVE, name: "Short Leave", color: ATTENDANCE_COLORS.short_leave },
] as const;

export function AttendanceSplitCard({ userUUID }: IProps) {
  const { attendances: userAttendance } = useAppSelector((s) => s.attendancesSlice);

  const [tab, setTab] = useState<"week" | "month" | "year">("week");
  const [limit, setLimit] = useState<number>(7);
  const [dateRange, setDateRange] = useState<{ start_date?: string; end_date?: string }>(getDateRange(tab));

  const { isLoading } = useAttendanceFetch({ dateRange, currentPage: 1, itemsPerPage: limit, userUUID });

  useEffect(() => {
    if (tab === "week") setLimit(7);
    if (tab === "month") setLimit(31);
    if (tab === "year") setLimit(365);

    const { start_date, end_date } = getDateRange(tab);
    setDateRange({ start_date, end_date });
  }, [tab]);

  const chartData: AttendanceChartDatum[] = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of userAttendance.rows ?? []) {
      const status = String(row.status || "").toLowerCase();
      counts[status] = (counts[status] ?? 0) + 1;
    }

    return STATUS_META.map((meta) => ({
      name: meta.name,
      value: counts[meta.key] ?? 0,
      color: meta.color,
      fill: meta.color,
    }));
  }, [userAttendance.rows]);

  const totalDays = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <Tabs
        defaultValue="week"
        value={tab}
        onValueChange={(value) => setTab(value as "week" | "month" | "year")}
        className="items-end"
      >
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
      </Tabs>
      <div>
        {isLoading ? (
          <div className="flex h-70 items-center justify-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="relative h-70 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip wrapperStyle={{ zIndex: 30 }} content={<CustomPieTooltip total={totalDays} />} />
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.fill}
                        stroke="none"
                        className="cursor-pointer transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-foreground">{totalDays}</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Total Days
                </span>
              </div>
            </div>

            <ul className="min-w-[150px] space-y-2.5">
              {chartData.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto tabular-nums font-medium text-foreground">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}