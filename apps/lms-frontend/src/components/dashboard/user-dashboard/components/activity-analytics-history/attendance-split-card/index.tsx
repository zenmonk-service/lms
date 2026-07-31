"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { LoaderCircle, Plane, UserCheck, UserMinus, type LucideIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";;
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

const STAT_ICONS: Record<string, LucideIcon> = {
  Present: UserCheck,
  Absent: UserMinus,
  "On Leave": Plane,
};

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

  const attendanceSummary = useMemo(() => {
    return (userAttendance.rows ?? []).reduce(
      (acc, row) => {
        const status = String(row.status || "").toLowerCase();
        if (status === AttendanceStatus.PRESENT) acc.present += 1;
        else if (status === AttendanceStatus.ABSENT) acc.absent += 1;
        else if (status === AttendanceStatus.ON_LEAVE) acc.on_leave += 1;
        return acc;
      },
      { present: 0, absent: 0, on_leave: 0 },
    );
  }, [userAttendance]);

  const chartData: AttendanceChartDatum[] = useMemo(
    () => [
      { name: "Present", value: attendanceSummary.present, color: ATTENDANCE_COLORS.present, fill: ATTENDANCE_COLORS.present },
      { name: "Absent", value: attendanceSummary.absent, color: ATTENDANCE_COLORS.absent, fill: ATTENDANCE_COLORS.absent },
      { name: "On Leave", value: attendanceSummary.on_leave, color: ATTENDANCE_COLORS.on_leave, fill: ATTENDANCE_COLORS.on_leave },
    ],
    [attendanceSummary],
  );

  const totalDays = attendanceSummary.present + attendanceSummary.absent + attendanceSummary.on_leave;

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

            <div className="space-y-4">
              {chartData.map((item) => {
                const percent = totalDays > 0 ? Math.round((item.value / totalDays) * 100) : 0;
                const Icon = STAT_ICONS[item.name];

                return (
                  <div
                    key={item.name}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-fit p-2 items-center justify-center rounded-lg border border-border bg-muted"
                          style={{ color: item.color }}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground">{item.name}</p>
                          <p className="text-md font-bold text-foreground">{item.value}</p>
                        </div>
                      </div>

                      <div className="text-right flex-1">
                        <p className="text-xs font-bold text-muted-foreground">{percent}%</p>
                        <Progress value={percent} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}