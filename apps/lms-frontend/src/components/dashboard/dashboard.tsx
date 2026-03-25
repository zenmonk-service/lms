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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  present: "#10b981",
  absent: "#ef4444",
  on_leave: "#f59e0b",
};

const LEAVE_STATUS_COLORS = {
  pending: "#6366f1",
  approved: "#10b981",
  recommended: "#3b82f6",
  rejected: "#ef4444",
  cancelled: "#8b5cf6",
};

interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload: { readonly status: string; readonly total: number } }>;
}

function CustomBarTooltip({ active, payload }: Readonly<CustomTooltipProps>) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="font-semibold text-foreground">{data.status}</p>
      <p className="text-sm text-muted-foreground">
        Total: <span className="font-bold text-primary">{data.total}</span>
      </p>
    </div>
  );
}

interface CustomPieTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload: { readonly name: string; readonly value: number } }>;
}

function CustomPieTooltip({ active, payload }: Readonly<CustomPieTooltipProps>) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="font-semibold text-foreground">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        Days: <span className="font-bold text-primary">{data.value}</span>
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
  const analyticsUserName = targetUserName || selectedUserName || currentUser?.name || "User dashboard";
  const analyticsUserEmail = targetUserEmail || selectedUserEmail || "";

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [leaveRows, setLeaveRows] = useState<LeaveRow[]>([]);



  const monthStart = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedMonth, selectedYear]
  );

  const monthEnd = useMemo(
    () => new Date(selectedYear, selectedMonth + 1, 0),
    [selectedMonth, selectedYear]
  );

  const dateRange = useMemo(
    () => ({
      start_date: monthStart.toISOString().slice(0, 10),
      end_date: monthEnd.toISOString().slice(0, 10),
    }),
    [monthStart, monthEnd]
  );

  const monthLabel = useMemo(
    () =>
      monthStart.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [monthStart]
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
    []
  );

  useEffect(() => {
    dispatch(
      getOrganizationUserDataAction({
        organizationId: organization_uuid,
        email,
      })
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
            })
          ).unwrap(),
          dispatch(
            getUserLeaveRequestsAction({
              org_uuid: organization_uuid,
              user_uuid: analyticsUserId,
              page: 1,
              limit: 200,
            })
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
      { present: 0, absent: 0, on_leave: 0 }
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
        else if (status === LeaveRequestStatus.RECOMMENDED) acc.recommended += 1;
        else if (status === LeaveRequestStatus.CANCELLED) acc.cancelled += 1;
        return acc;
      },
      {
        approved: 0,
        rejected: 0,
        pending: 0,
        recommended: 0,
        cancelled: 0,
      }
    );
  }, [monthlyLeaveRequests]);

  const attendanceChartData = useMemo(
    () => [
      { name: "Present", value: attendanceSummary.present, fill: ATTENDANCE_COLORS.present },
      { name: "Absent", value: attendanceSummary.absent, fill: ATTENDANCE_COLORS.absent },
      { name: "On Leave", value: attendanceSummary.on_leave, fill: ATTENDANCE_COLORS.on_leave },
    ],
    [attendanceSummary]
  );

  const leaveChartData = useMemo(
    () => [
      { status: "Pending", total: leaveStatusSummary.pending, fill: LEAVE_STATUS_COLORS.pending },
      { status: "Approved", total: leaveStatusSummary.approved, fill: LEAVE_STATUS_COLORS.approved },
      { status: "Recommended", total: leaveStatusSummary.recommended, fill: LEAVE_STATUS_COLORS.recommended },
      { status: "Rejected", total: leaveStatusSummary.rejected, fill: LEAVE_STATUS_COLORS.rejected },
      { status: "Cancelled", total: leaveStatusSummary.cancelled, fill: LEAVE_STATUS_COLORS.cancelled },
    ],
    [leaveStatusSummary]
  );

  const totalAttendanceDays =
    attendanceSummary.present + attendanceSummary.absent + attendanceSummary.on_leave;

  if (!analyticsUserId && isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto relative overflow-hidden rounded-2xl bg-linear-to-b from-background via-background to-muted/20 ">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Personal analytics
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {analyticsUserName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
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
          <div className="flex h-80 items-center justify-center rounded-2xl border border-border/70 bg-card/60">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Present days</p>
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">{attendanceSummary.present}</p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Absent days</p>
                    <UserMinus className="h-4 w-4 text-rose-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">{attendanceSummary.absent}</p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">On leave days</p>
                    <Plane className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">{attendanceSummary.on_leave}</p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Leave requests</p>
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-3xl font-bold">{monthlyLeaveRequests.length}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartNoAxesCombined className="h-4 w-4 text-primary" />
                    Attendance split
                  </CardTitle>
                  <CardDescription>
                    Present vs absent vs leave for {monthLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-70 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceChartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          startAngle={90}
                          endAngle={-270}
                        >
                          {attendanceChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attendanceChartData.map((item) => (
                      <Badge key={item.name} variant="outline" className="rounded-md">
                        {item.name}: {item.value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Leave request status
                  </CardTitle>
                  <CardDescription>
                    Current user leave requests in {monthLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leaveChartData} accessibilityLayer margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                        <CartesianGrid vertical={false} className="stroke-border/50" />
                        <XAxis 
                          dataKey="status"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                          content={<CustomBarTooltip />}
                        />
                        <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                          {leaveChartData.map((entry) => (
                            <Cell key={entry.status} fill={entry.fill} />
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
                  Total attendance records: {totalAttendanceDays} · Leave requests: {monthlyLeaveRequests.length}
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
                        Status: {leave.status} {leave.leave_duration ? `· ${leave.leave_duration}` : ""}
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
