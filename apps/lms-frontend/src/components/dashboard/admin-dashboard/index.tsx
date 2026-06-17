"use client";
import DataTable from "@/shared/table";
import {
  Clock3,
  CalendarDays,
  ChartNoAxesCombined,
  UserCheck,
  UserMinus,
  Plane,
  Clock,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import dayjs from "dayjs";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CustomBarTooltip, CustomPieTooltip } from "../shared/custom-tooltips";
import { generateAttendanceColumns } from "./columndef";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getAttendanceReportAction } from "@/features/attendances/report/report.action";
import { AttendanceReportRow } from "@/features/attendances/attendances.type";
import { Skeleton } from "@/components/ui/skeleton";

const ATTENDANCE_COLORS = {
  present: "var(--chart-1)",
  absent: "var(--chart-2)",
  on_leave: "var(--chart-3)",
  late: "var(--chart-4)",
};
export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState<string>(dayjs().format("YYYY-MM"));
  const { report, loading } = useAppSelector((state) => state.attendancesSlice);
  console.log("✌️report --->", report);

  const { uuid } = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization,
  );
  const [selectedDay, setSelectedDay] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const data = report?.user_attendance_report?.rows as AttendanceReportRow[];

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const todayAttendance = [
    {
      name: "Present",
      value: Number(report?.daily_attendance_report?.present_count),
      color: ATTENDANCE_COLORS.present,
    },
    {
      name: "Absent",
      value: Number(report?.daily_attendance_report?.absent_count),
      color: ATTENDANCE_COLORS.absent,
    },
    {
      name: "On Leave",
      value: Number(report?.daily_attendance_report?.on_leave_count),
      color: ATTENDANCE_COLORS.on_leave,
    },
    {
      name: "Late",
      value: Number(report?.daily_attendance_report?.late_count),
      color: ATTENDANCE_COLORS.late,
    },
  ];

  const monthlyReportSummary = (() => {
    const monthlyData = report?.monthly_attendance_report ?? [];

    const monthlyDataMap = new Map(
      monthlyData.map((item) => [
        item.month,
        {
          ...item,
          present_count: Number(item.present_count),
          late_count: Number(item.late_count),
          on_leave_count: Number(item.on_leave_count),
          absent_count: Number(item.absent_count),
        },
      ]),
    );

    return Array.from({ length: 6 }, (_, index) => {
      const month = dayjs()
        .subtract(5 - index, "month")
        .format("YYYY-MM");

      return (
        monthlyDataMap.get(month) ?? {
          month,
          present_count: 0,
          late_count: 0,
          on_leave_count: 0,
          absent_count: 0,
        }
      );
    });
  })();

  useEffect(() => {
    dispatch(
      getAttendanceReportAction({
        page: pagination.page,
        limit: pagination.limit,
        search: pagination.search,
        org_uuid: uuid,
        date: selectedDay,
        month_filter: month,

        status: selectedStatus === "all" ? undefined : selectedStatus,
      }),
    );
  }, [
    dispatch,
    uuid,
    pagination.page,
    pagination.limit,
    pagination.search,
    selectedDay,
    selectedStatus,
    month,
  ]);

  const exportAttendanceExcel = (users: any[], month: string) => {
    const daysInMonth = dayjs(month).daysInMonth();

    const statusMap: Record<string, string> = {
      present: "P",
      absent: "A",
      on_leave: "L",
      late: "LT",
      holiday: "H",
      org_holiday: "OH",
      week_off: "WO",
    };

    const sheetData: any[][] = [];

    // Header Row
    sheetData.push([
      "Employee",
      "Type",
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      "Present",
      "Absent",
      "Leave",
      "Hours",
    ]);

    users.forEach((user) => {
      const statusRow: any[] = [user.name, "Status"];
      const checkInRow: any[] = ["", "Check In"];
      const checkOutRow: any[] = ["", "Check Out"];
      const hoursRow: any[] = ["", "Working Hours"];

      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let totalHours = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const attendance = user.attendances.find(
          (a: any) => dayjs(a.date).date() === day,
        );

        // Status
        statusRow.push(
          statusMap[attendance?.status] ?? attendance?.status ?? "-",
        );

        // Check In
        checkInRow.push(attendance?.check_in ?? "-");

        // Check Out
        checkOutRow.push(attendance?.check_out ?? "-");

        // Working Hours
        const hours =
          attendance?.working_hours ?? attendance?.affected_hours ?? "-";

        hoursRow.push(hours);

        // Summary
        if (attendance?.status === "present") presentCount++;
        if (attendance?.status === "absent") absentCount++;
        if (attendance?.status === "on_leave") leaveCount++;

        totalHours += Number(
          attendance?.working_hours ?? attendance?.affected_hours ?? 0,
        );
      }

      // Summary columns only on Status row
      statusRow.push(
        presentCount,
        absentCount,
        leaveCount,
        totalHours.toFixed(2),
      );

      // Empty summary columns for detail rows
      checkInRow.push("", "", "", "");
      checkOutRow.push("", "", "", "");
      hoursRow.push("", "", "", "");

      sheetData.push(statusRow);
      sheetData.push(checkInRow);
      sheetData.push(checkOutRow);
      sheetData.push(hoursRow);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Merge employee cells
    worksheet["!merges"] = [];

    const merges: XLSX.Range[] = [];

    let rowIndex = 1;

    users.forEach(() => {
      merges.push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex + 3, c: 0 },
      });

      rowIndex += 4;
    });

    worksheet["!merges"] = merges;
    // Column widths
    worksheet["!cols"] = [
      { wch: 25 }, // Employee
      { wch: 18 }, // Type
      ...Array.from({ length: daysInMonth }, () => ({
        wch: 12,
      })),
      { wch: 10 }, // Present
      { wch: 10 }, // Absent
      { wch: 10 }, // Leave
      { wch: 12 }, // Hours
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `attendance-${month}.xlsx`,
    );
  };
  return (
    <div className="flex items-center justify-center">
      <div className="w-11/12 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Today
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              {dayjs().format("DD MMMM YYYY")}
            </h2>
          </div>
        </div>

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

        <DataTable
          data={data}
          month={month}
          setMonth={setMonth}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          columns={generateAttendanceColumns(
            "2026-06",
            selectedDay,
            setSelectedDay,
          )}
          isLoading={loading}
          totalCount={report?.user_attendance_report?.count || 0}
          isExport={true}
          onExport={() => exportAttendanceExcel(data, "2026-06")}
          showPagination={true}
          pagination={pagination}
          onPaginationChange={(state) =>
            setPagination({ ...pagination, ...state })
          }
        />
      </div>
    </div>
  );
}
