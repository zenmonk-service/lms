"use client";
import DataTable from "@/shared/table";
import { CalendarDays, Download, FileSpreadsheet, Upload } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
import { generateAttendanceColumns } from "./columndef";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getAttendanceReportAction } from "@/features/attendances/report/report.action";
import {
  AttendanceReportRow,
  AttendanceStatus,
} from "@/features/attendances/attendances.type";
import Charts from "./chats";
import { uploadAttendanceReportAction } from "@/features/attendances/upload-attendance/upload-attendance.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { attendanceColumns } from "./day-wise-coulumdef";
import { DatePicker } from "@/components/ui/date-picker";
import { ATTENDANCE_COLORS } from "../../user-dashboard/dashboard.constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateAttendanceAction } from "@/features/attendances/update-attendance/update-attendance.action";
import { formatAttendanceTime } from "@/utils/format-time";
import AttendanceUpdateDialog from "./attendance-update-dialog";
import { UpdateTimeForm, updateTimeSchema } from "./attendance.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAttendanceAction } from "@/features/attendances/create-attendance/create-attendance.action";
export default function AdminDashboardAttendance() {
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState<string>(dayjs().format("YYYY-MM"));
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { report, loading } = useAppSelector((state) => state.attendancesSlice);
  const { uuid } = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization,
  );
  const [viewMode, setViewMode] = useState<"month" | "day">("day");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const monthData = report?.user_attendance_report
    ?.rows as AttendanceReportRow[];
  const dayData = report?.day_wise_attendance_report
    ?.rows as AttendanceReportRow[];
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceReportRow | null>(null);

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    search: "",
  });
  const [paginationDayAttendance, setPaginationDayAttendance] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const form = useForm<UpdateTimeForm>({
    resolver: zodResolver(updateTimeSchema),
    defaultValues: {
      check_in: "",
      check_out: "",
    },
  });
  const onMarkAttendance = (
    employee: AttendanceReportRow,
    status: AttendanceStatus,
  ) => {
    form.reset({
      check_in: employee.attendances[0]?.check_in
        ? dayjs(
            formatAttendanceTime(employee.attendances[0]?.check_in),
            "hh:mm A",
          ).format("HH:mm:ss")
        : "",
      check_out: employee.attendances[0]?.check_out
        ? dayjs(
            formatAttendanceTime(employee.attendances[0]?.check_out),
            "hh:mm A",
          ).format("HH:mm:ss")
        : "",
    });
    setSelectedAttendance({
      ...employee,
      attendances: [
        {
          ...employee.attendances[0],
          status: status ?? employee.attendances[0]?.status,
        },
        ...employee.attendances.slice(1),
      ],
    });
    setIsTimeModalOpen(true);
  };

  const todayAttendance = useMemo(() => {
    return [
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
  }, [report, month]);

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

  const getUserAttendances = async () => {
    if (viewMode === "day") {
      await dispatch(
        getAttendanceReportAction({
          page: paginationDayAttendance.page,
          search: paginationDayAttendance.search,
          limit: paginationDayAttendance.limit,
          org_uuid: uuid,
          date: dayjs(date).format("YYYY-MM-DD"),
          status: selectedStatus === "all" ? undefined : selectedStatus,
        }),
      );
    } else {
      await dispatch(
        getAttendanceReportAction({
          page: pagination.page,
          search: pagination.search,
          limit: pagination.limit,
          org_uuid: uuid,
          month: month,
        }),
      );
    }
  };

  useEffect(() => {
    getUserAttendances();
  }, [
    dispatch,
    uuid,
    pagination.page,
    pagination.limit,
    pagination.search,
    month,
    viewMode,
    paginationDayAttendance.page,
    paginationDayAttendance.limit,
    paginationDayAttendance.search,
    date,
    selectedStatus,
  ]);

  const exportAttendanceExcel = (users: any[], month: string) => {};

  const onUpload = (formData: FormData) => {
    dispatch(uploadAttendanceReportAction(formData)).then(() => {
      getUserAttendances();
    });
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("org_uuid", uuid);

    onUpload(formData);

    // allow selecting same file again
    event.target.value = "";
  };

  const onSubmit = (data: UpdateTimeForm) => {
    if (!selectedAttendance) return;
    if (selectedAttendance.attendances[0]?.uuid) {
      dispatch(
        updateAttendanceAction({
          org_uuid: uuid,
          uuid: selectedAttendance.attendances[0].uuid,
          status: selectedAttendance.attendances[0].status,
          check_in: data.check_in,
          check_out: data.check_out,
        }),
      ).then(() => {
        getUserAttendances();
      });
    } else {
      dispatch(
        createAttendanceAction({
          org_uuid: uuid,
          user_uuid: selectedAttendance.user_id,
          status: selectedAttendance.attendances[0].status,
          check_in: data.check_in,
          check_out: data.check_out,
          date: dayjs(date).format("YYYY-MM-DD"),
        }),
      ).then(() => {
        getUserAttendances();
      });
    }

    setIsTimeModalOpen(false);
  };

  return (
    <>
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
        loading={loading && !report?.daily_attendance_report}
        todayAttendance={todayAttendance}
        monthlyReportSummary={monthlyReportSummary}
        report={report}
        selectedDay={dayjs().format("YYYY-MM-DD")}
      />
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as "month" | "day")}
      >
        <TabsList>
          <TabsTrigger value="day">Daily Attendance</TabsTrigger>
          <TabsTrigger value="month">Monthly Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="month">
          <DataTable
            data={monthData}
            columns={generateAttendanceColumns(
              month,
              dayjs().format("YYYY-MM-DD"),
            )}
            isLoading={loading}
            totalCount={report?.user_attendance_report?.count || 0}
            showPagination={true}
            pagination={pagination}
            onPaginationChange={(state) =>
              setPagination({ ...pagination, ...state })
            }
          >
            <div className=" flex justify-end gap-2">
              <MonthPicker value={month} onChange={setMonth} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileSpreadsheet className="mr-4 h-4 w-4" />
                    Report Actions
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => exportAttendanceExcel(monthData, month)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DataTable>
        </TabsContent>

        <TabsContent value="day">
          <DataTable
            data={dayData}
            columns={attendanceColumns({
              onMarkAttendance,
            })}
            isLoading={loading}
            totalCount={report?.user_attendance_report?.count || 0}
            showPagination={true}
            pagination={paginationDayAttendance}
            onPaginationChange={(state) =>
              setPaginationDayAttendance({
                ...paginationDayAttendance,
                ...state,
              })
            }
          >
            <div className="flex justify-end gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>

                  <SelectItem value="present">Present</SelectItem>

                  <SelectItem value="absent">Absent</SelectItem>

                  <SelectItem value="late">Late</SelectItem>

                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              <DatePicker date={date} setDate={setDate} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileSpreadsheet className="mr-4 h-4 w-4" />
                    Report Actions
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => exportAttendanceExcel(dayData, month)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </DropdownMenuItem>

                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault(); // prevent menu weirdness
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Report
                    </DropdownMenuItem>
                  </>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DataTable>
        </TabsContent>
      </Tabs>
      <AttendanceUpdateDialog
        onSubmit={onSubmit}
        isTimeModalOpen={isTimeModalOpen}
        setIsTimeModalOpen={setIsTimeModalOpen}
        form={form}
      />
    </>
  );
}
