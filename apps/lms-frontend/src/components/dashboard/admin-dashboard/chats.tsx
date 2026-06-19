import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartNoAxesCombined,
  Clock,
  Clock3,
  Plane,
  UserCheck,
  UserMinus,
} from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomBarTooltip, CustomPieTooltip } from "../shared/custom-tooltips";
import { Progress } from "@/components/ui/progress";
import {
  AttendanceReport,
  MonthlySummary,
} from "@/features/attendances/attendances.type";
const ATTENDANCE_COLORS = {
  present: "var(--chart-1)",
  absent: "var(--chart-2)",
  on_leave: "var(--chart-3)",
  late: "var(--chart-4)",
};
export default function Charts({
  loading,
  todayAttendance,
  monthlyReportSummary,
  selectedDay,
  report,
}: {
  loading: boolean;
  todayAttendance: { name: string; value: number; color: string }[];
  monthlyReportSummary: MonthlySummary[];
  selectedDay: string;
  report: AttendanceReport | null;
}) {
  return (
    <div>
      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2 mb-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full rounded-lg" />
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2 mb-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartNoAxesCombined className="h-4 w-4" />
                Attendance split
              </CardTitle>
              <CardDescription>
                {selectedDay} attendance statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="relative h-70 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        wrapperStyle={{ zIndex: 30 }}
                        content={
                          <CustomPieTooltip
                            total={Number(
                              report?.user_attendance_report?.count,
                            )}
                          />
                        }
                      />
                      <Pie
                        data={todayAttendance}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {todayAttendance.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            stroke="none"
                            className="cursor-pointer transition-opacity hover:opacity-80"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-foreground">
                      {report?.user_attendance_report?.count}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Total Employees
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {todayAttendance.map((item) => {
                    const percent =
                      item.value > 0 &&
                      Number(report?.user_attendance_report?.count) > 0
                        ? Math.round(
                            (item.value /
                              Number(report?.user_attendance_report?.count)) *
                              100,
                          )
                        : 0;

                    return (
                      <div
                        key={item.name}
                        className="group rounded-xl border border-border bg-muted/20 p-3 transition-all hover:bg-card hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background"
                              style={{ color: item.color }}
                            >
                              {item.name === "Present" && (
                                <UserCheck className="h-5 w-5" />
                              )}
                              {item.name === "Absent" && (
                                <UserMinus className="h-5 w-5" />
                              )}
                              {item.name === "On Leave" && (
                                <Plane className="h-5 w-5" />
                              )}
                              {item.name === "Late" && (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">
                                {item.name}
                              </p>
                              <p className="text-md font-bold text-foreground">
                                {item.value > 0 ? item.value : 0}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-1">
                            <p className="text-xs font-bold text-muted-foreground">
                              {percent}%
                            </p>
                            <Progress value={percent} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                Attendance Rate
              </CardTitle>
              <CardDescription>
                Past 6 months attendance statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-75 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyReportSummary}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--muted)"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--muted-foreground)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--muted-foreground)",
                        fontSize: 10,
                      }}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={<CustomBarTooltip />}
                      cursor={{ fill: "var(--muted)" }}
                    />
                    <Bar
                      dataKey="present_count"
                      name="Present"
                      radius={[4, 4, 0, 0]}
                      fill={ATTENDANCE_COLORS.present}
                    />

                    <Bar
                      dataKey="late_count"
                      name="Late"
                      radius={[4, 4, 0, 0]}
                      fill={ATTENDANCE_COLORS.late}
                    />

                    <Bar
                      dataKey="on_leave_count"
                      name="On Leave"
                      radius={[4, 4, 0, 0]}
                      fill={ATTENDANCE_COLORS.on_leave}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
