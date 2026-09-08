import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartNoAxesCombined, Clock3, Download } from "lucide-react";
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
import {
  CustomBarTooltip,
  CustomPieTooltip,
} from "../../../shared/custom-tooltips";
import {
  AttendanceReport,
  MonthlySummary,
} from "@/features/attendances/attendances.type";
import { ATTENDANCE_COLORS } from "../../../user-dashboard/dashboard.constants";
import { useAppDispatch, useAppSelector } from "@/store";
import { DownloadAttendanceType } from "@/features/attendances/download/download.types";
import { downloadAttendanceReportAction } from "@/features/attendances/download/download.action";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";

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
  const totalDailyEmployees = report?.day_wise_attendance_report?.total ?? 0;

  const orgUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const dispatch = useAppDispatch();
  const can = usePermissionCheck();

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
        <div className="grid gap-2 xl:grid-cols-2 mb-6">
          <Card className="border border-border">
            <CardHeader className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2">
                  <ChartNoAxesCombined className="h-4 w-4 " />
                  Attendance split
                </CardTitle>
                <CardDescription>
                  {selectedDay} attendance statistics
                </CardDescription>
              </div>
              {can(
                PermissionTag.ATTENDANCE_REPORT_MANAGEMENT,
                PermissionAction.READ,
              ) && (
                <Download
                  className="h-5 w-5 text-primary cursor-pointer "
                  onClick={() => {
                    dispatch(
                      downloadAttendanceReportAction({
                        org_uuid: orgUuid,
                        date: selectedDay,
                        type: DownloadAttendanceType.DAILY_ATTENDANCE_ANALYTICS,
                      }),
                    );
                  }}
                />
              )}
            </CardHeader>
            <CardContent>
              <div className="grid items-center gap-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="relative h-70 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        wrapperStyle={{ zIndex: 30 }}
                        content={
                          <CustomPieTooltip total={totalDailyEmployees} />
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
                      {totalDailyEmployees}
                    </span>
                    <span className="text-muted-foreground text-xs font-medium">
                      Total Employees
                    </span>
                  </div>
                </div>

                <ul className="min-w-[150px] space-y-2.5">
                  {todayAttendance.map((item) => (
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
                        {item.value > 0 ? item.value : 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex items-center justify-between  gap-2">
              <div className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Attendance Rate
                </CardTitle>
                <CardDescription>
                  Past 6 months attendance statistics
                </CardDescription>
              </div>
              {can(
                PermissionTag.ATTENDANCE_REPORT_MANAGEMENT,
                PermissionAction.READ,
              ) && (
                <Download
                  className="h-5 w-5 text-primary cursor-pointer "
                  onClick={() =>
                    dispatch(
                      downloadAttendanceReportAction({
                        org_uuid: orgUuid,
                        type: DownloadAttendanceType.MONTHLY_ATTENDANCE_ANALYTICS,
                      }),
                    )
                  }
                />
              )}
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
                      maxBarSize={14}
                      fill={ATTENDANCE_COLORS.present}
                    />

                    <Bar
                      dataKey="absent_count"
                      name="Absent"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={14}
                      fill={ATTENDANCE_COLORS.absent}
                    />

                    <Bar
                      dataKey="late_count"
                      name="Late"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={14}
                      fill={ATTENDANCE_COLORS.late}
                    />

                    <Bar
                      dataKey="half_day_count"
                      name="Half Day"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={14}
                      fill={ATTENDANCE_COLORS.half_day}
                    />

                    <Bar
                      dataKey="on_leave_count"
                      name="On Leave"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={14}
                      fill={ATTENDANCE_COLORS.on_leave}
                    />

                    <Bar
                      dataKey="early_departure_count"
                      name="Early Departure"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={14}
                      fill={ATTENDANCE_COLORS.early_departure}
                    />

                    <Bar
                      dataKey="short_leave_count"
                      name="Short Leave"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={14}
                      fill={ATTENDANCE_COLORS.short_leave}
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
