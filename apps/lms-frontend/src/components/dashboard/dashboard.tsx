"use client";
import { useEffect, useMemo, useState } from "react";
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
  CalendarDays,
  ChartNoAxesCombined,
  Clock3,
  Loader2,
  MoreHorizontal,
  Plane,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { getOrganizationUserDataAction } from "@/features/organizations/organizations.action";
import { getUserAttendancesAction } from "@/features/attendances/attendances.action";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { getUserLeaveRequestsAction } from "@/features/leave-requests/leave-requests.action";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "../ui/progress";

interface AttendanceRow {
  date: string;
  status: string;
}

interface LeaveRow {
  uuid: string;
  status: LeaveRequestStatus | string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  reason?: string;
  leave_duration?: string;
}

const ATTENDANCE_COLORS = {
  present: "var(--chart-1)",
  absent: "var(--chart-2)",
  on_leave: "var(--chart-3)",
};

const LEAVE_STATUS_COLORS = {
  pending: "var(--chart-1)",
  approved: "var(--chart-2)",
  recommended: "var(--chart-3)",
  rejected: "var(--chart-4)",
  cancelled: "var(--chart-5)",
};

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly payload: { readonly status: string; readonly total: number };
  }>;
}

function CustomBarTooltip({ active, payload }: Readonly<CustomTooltipProps>) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background p-2 text-xs font-medium shadow-md">
      <p>{`${data.status}: ${data.total} Request(s)`}</p>
    </div>
  );
}

interface CustomPieTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly payload: {
      readonly name: string;
      readonly value: number;
      readonly color?: string;
    };
  }>;
  readonly total?: number;
}

function CustomPieTooltip({
  active,
  payload,
  total = 0,
}: Readonly<CustomPieTooltipProps>) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;
  const percentage = total > 0 ? (data.value / total) * 100 : 0;
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-xs shadow-lg">
      <p className="mb-1 font-bold text-foreground">{data.name}</p>
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: data.color || "hsl(var(--foreground))" }}
        />
        <span className="text-muted-foreground">{data.value} days</span>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {percentage.toFixed(1)}% of total
      </p>
    </div>
  );
}

function Dashboard({
  organization_uuid,
  email,
  targetUserId,
  targetUserName,
  targetUserEmail,
}: Readonly<{
  organization_uuid: string;
  email: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
}>) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const currentUser = useAppSelector((state) => state.userSlice.currentUser);

  const selectedUserId = searchParams.get("user_uuid");
  const selectedUserName = searchParams.get("user_name");
  const selectedUserEmail = searchParams.get("user_email");
  const analyticsUserId = targetUserId || selectedUserId || currentUser.user_id;
  const analyticsUserName =
    targetUserName || selectedUserName || currentUser?.name || "User dashboard";
  const analyticsUserEmail = targetUserEmail || selectedUserEmail || "";

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [leaveRows, setLeaveRows] = useState<LeaveRow[]>([]);

  const monthStart = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedMonth, selectedYear],
  );

  const monthEnd = useMemo(
    () => new Date(selectedYear, selectedMonth + 1, 0),
    [selectedMonth, selectedYear],
  );

  const dateRange = useMemo(
    () => ({
      start_date: monthStart.toISOString().slice(0, 10),
      end_date: monthEnd.toISOString().slice(0, 10),
    }),
    [monthStart, monthEnd],
  );

  const monthLabel = useMemo(
    () =>
      monthStart.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [monthStart],
  );

  const years = useMemo(() => {
    const currentYear = today.getFullYear();
    return Array.from({ length: 6 }, (_, index) => currentYear - 3 + index);
  }, [today]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index,
        label: new Date(2000, index, 1).toLocaleString("en-US", {
          month: "long",
        }),
      })),
    [],
  );

  useEffect(() => {
    dispatch(
      getOrganizationUserDataAction({
        organizationId: organization_uuid,
        email,
      }),
    );
  }, [organization_uuid, email]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!analyticsUserId || !organization_uuid) return;

      setIsLoading(true);
      try {
        const [attendanceResponse, leaveResponse] = await Promise.all([
          dispatch(
            getUserAttendancesAction({
              org_uuid: organization_uuid,
              user_uuid: analyticsUserId,
              page: 1,
              limit: 366,
              date_range: dateRange,
            }),
          ).unwrap(),
          dispatch(
            getUserLeaveRequestsAction({
              org_uuid: organization_uuid,
              user_uuid: analyticsUserId,
              page: 1,
              limit: 200,
            }),
          ).unwrap(),
        ]);

        const attendanceData = Array.isArray(attendanceResponse?.rows)
          ? attendanceResponse.rows
          : [];
        const leaveData = Array.isArray(leaveResponse?.rows)
          ? leaveResponse.rows
          : [];

        setAttendanceRows(attendanceData);
        setLeaveRows(leaveData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dispatch, organization_uuid, analyticsUserId, dateRange]);

  const attendanceSummary = useMemo(() => {
    return attendanceRows.reduce(
      (acc, row) => {
        const status = String(row.status || "").toLowerCase();
        if (status === AttendanceStatus.PRESENT) acc.present += 1;
        else if (status === AttendanceStatus.ABSENT) acc.absent += 1;
        else if (status === AttendanceStatus.ON_LEAVE) acc.on_leave += 1;
        return acc;
      },
      { present: 0, absent: 0, on_leave: 0 },
    );
  }, [attendanceRows]);

  const monthlyLeaveRequests = useMemo(() => {
    const from = monthStart.getTime();
    const to = monthEnd.getTime();

    return leaveRows.filter((leave) => {
      const sourceDate = leave.created_at || leave.start_date || leave.end_date;
      if (!sourceDate) return false;
      const parsed = new Date(sourceDate).getTime();
      return parsed >= from && parsed <= to;
    });
  }, [leaveRows, monthStart, monthEnd]);

  const leaveStatusSummary = useMemo(() => {
    return monthlyLeaveRequests.reduce(
      (acc, row) => {
        const status = String(row.status || "");
        if (status === LeaveRequestStatus.APPROVED) acc.approved += 1;
        else if (status === LeaveRequestStatus.REJECTED) acc.rejected += 1;
        else if (status === LeaveRequestStatus.PENDING) acc.pending += 1;
        else if (status === LeaveRequestStatus.RECOMMENDED)
          acc.recommended += 1;
        else if (status === LeaveRequestStatus.CANCELLED) acc.cancelled += 1;
        return acc;
      },
      {
        approved: 0,
        rejected: 0,
        pending: 0,
        recommended: 0,
        cancelled: 0,
      },
    );
  }, [monthlyLeaveRequests]);

  const attendanceChartData = useMemo(
    () => [
      {
        name: "Present",
        value: attendanceSummary.present,
        color: ATTENDANCE_COLORS.present,
        fill: ATTENDANCE_COLORS.present,
      },
      {
        name: "Absent",
        value: attendanceSummary.absent,
        color: ATTENDANCE_COLORS.absent,
        fill: ATTENDANCE_COLORS.absent,
      },
      {
        name: "On Leave",
        value: attendanceSummary.on_leave,
        color: ATTENDANCE_COLORS.on_leave,
        fill: ATTENDANCE_COLORS.on_leave,
      },
    ],
    [attendanceSummary],
  );

  const leaveChartData = useMemo(
    () => [
      {
        status: "Pending",
        total: leaveStatusSummary.pending,
        fill: LEAVE_STATUS_COLORS.pending,
      },
      {
        status: "Approved",
        total: leaveStatusSummary.approved,
        fill: LEAVE_STATUS_COLORS.approved,
      },
      {
        status: "Recommended",
        total: leaveStatusSummary.recommended,
        fill: LEAVE_STATUS_COLORS.recommended,
      },
      {
        status: "Rejected",
        total: leaveStatusSummary.rejected,
        fill: LEAVE_STATUS_COLORS.rejected,
      },
      {
        status: "Cancelled",
        total: leaveStatusSummary.cancelled,
        fill: LEAVE_STATUS_COLORS.cancelled,
      },
    ],
    [leaveStatusSummary],
  );

  const totalAttendanceDays =
    attendanceSummary.present +
    attendanceSummary.absent +
    attendanceSummary.on_leave;

  if (!analyticsUserId && isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto overflow-hidden rounded-2xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Personal analytics
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              {analyticsUserName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {analyticsUserEmail ? `${analyticsUserEmail} · ` : ""}
              Attendance and leave analytics for {monthLabel}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(selectedMonth)}
              onValueChange={(value) => setSelectedMonth(Number(value))}
            >
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-30">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {["present", "absent", "leave", "requests"].map((key) => (
                <Card key={key} className="border-border/70 shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
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
          </>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Present days
                    </p>
                    <UserCheck className="h-4 w-4 text-chart-1" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">
                    {attendanceSummary.present}
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Absent days</p>
                    <UserMinus className="h-4 w-4 text-chart-2" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">
                    {attendanceSummary.absent}
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      On leave days
                    </p>
                    <Plane className="h-4 w-4 text-chart-3" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">
                    {attendanceSummary.on_leave}
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Leave requests
                    </p>
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">
                    {monthlyLeaveRequests.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartNoAxesCombined className="h-4 w-4" />
                    Attendance split
                  </CardTitle>
                  <CardDescription>
                    Real-time tracking for{" "}
                    <span className="font-medium text-foreground">
                      {monthLabel}
                    </span>
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
                              <CustomPieTooltip total={totalAttendanceDays} />
                            }
                          />
                          <Pie
                            data={attendanceChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {attendanceChartData.map((entry) => (
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
                        <span className="text-3xl font-black text-foreground">
                          {totalAttendanceDays}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Total Days
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {attendanceChartData.map((item) => {
                        const percent =
                          totalAttendanceDays > 0
                            ? Math.round(
                                (item.value / totalAttendanceDays) * 100,
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
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-muted-foreground">
                                    {item.name}
                                  </p>
                                  <p className="text-md font-bold text-foreground">
                                    {item.value}
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
                    Leave request status
                  </CardTitle>
                  <CardDescription>
                    Current user leave requests in{" "}
                    <span className="text-foreground">{monthLabel}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-75 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={leaveChartData}
                        margin={{ top: 20, right: 30, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--muted)"
                        />
                        <XAxis
                          dataKey="status"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                          dy={10}
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
                        <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={45}>
                          {leaveChartData.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={entry.total > 0 ? entry.fill : "#e2e8f0"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Month snapshot</CardTitle>
                <CardDescription>
                  Total attendance records: {totalAttendanceDays} · Leave
                  requests: {monthlyLeaveRequests.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {monthlyLeaveRequests.length === 0 ? (
                  <p>No leave requests found for this month.</p>
                ) : (
                  monthlyLeaveRequests.slice(0, 6).map((leave) => (
                    <div
                      key={leave.uuid}
                      className="rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                    >
                      <p className="font-medium text-foreground">
                        {leave.start_date} → {leave.end_date}
                      </p>
                      <p>
                        Status: {leave.status}{" "}
                        {leave.leave_duration
                          ? `· ${leave.leave_duration}`
                          : ""}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
