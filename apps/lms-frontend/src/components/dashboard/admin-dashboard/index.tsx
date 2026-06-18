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
import { generateAttendanceColumns } from "./columndef";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getAttendanceReportAction } from "@/features/attendances/report/report.action";
import { AttendanceReportRow } from "@/features/attendances/attendances.type";
import Charts from "./chats";

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

        <Charts
          loading={loading}
          todayAttendance={todayAttendance}
          monthlyReportSummary={monthlyReportSummary}
          report={report}
          selectedDay={selectedDay}
        
        />

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
