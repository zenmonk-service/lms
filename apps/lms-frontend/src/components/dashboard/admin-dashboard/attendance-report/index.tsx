"use client";
import DataTable from "@/shared/table";
import { CalendarDays, Download, FileSpreadsheet, Upload } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
import { generateAttendanceColumns } from "./columndef/month-wise-columndef";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getAttendanceReportAction } from "@/features/attendances/report/report.action";
import {
  AttendanceReportRow,
  AttendanceStatus,
} from "@/features/attendances/attendances.type";
import Charts from "././chart/chats";
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
import { attendanceColumns } from "./columndef/day-wise-coulumdef";
import { DatePicker } from "@/components/ui/date-picker";
import { ATTENDANCE_COLORS } from "../../user-dashboard/dashboard.constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateAttendanceAction } from "@/features/attendances/update-attendance/update-attendance.action";
import AttendanceUpdateDialog from "./update-attendance-dailog/attendance-update-dialog";
import { UpdateTimeForm, updateTimeSchema } from "./attendance.type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAttendanceAction } from "@/features/attendances/create-attendance/create-attendance.action";
import { downloadAttendanceReportService } from "@/features/attendances/download/download.service";
import { ReportDownloadModal } from "./report-download-modal";
import { formatTime } from "@/utils/format-time";
import AdminDashboardLayout from "../layout";

export default function AdminDashboardAttendance() {
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState<string>(dayjs().format("YYYY-MM"));
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start_date?: string;
    end_date?: string;
  }>({ start_date: undefined, end_date: undefined });
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
  const [openReportModal, setOpenReportModal] = useState(false);
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
  }, [report?.daily_attendance_report]);

  const monthlyReportSummary = useMemo(() => {
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
  }, [report?.monthly_attendance_report]);

  const getDailyAttendance = useCallback(() => {
    if (!uuid) return;
    dispatch(
      getAttendanceReportAction({
        page: paginationDayAttendance.page,
        search: paginationDayAttendance.search,
        limit: paginationDayAttendance.limit,
        org_uuid: uuid,
        date: dayjs(date).format("YYYY-MM-DD"),
        status: selectedStatus === "all" ? undefined : selectedStatus,
      }),
    );
  }, [
    dispatch,
    uuid,
    paginationDayAttendance.page,
    paginationDayAttendance.limit,
    paginationDayAttendance.search,
    date,
    selectedStatus,
  ]);

  const getMonthlyAttendance = useCallback(() => {
    if (!uuid) return;
    dispatch(
      getAttendanceReportAction({
        page: pagination.page,
        search: pagination.search,
        limit: pagination.limit,
        org_uuid: uuid,
        month: month,
      }),
    );
  }, [
    dispatch,
    uuid,
    pagination.page,
    pagination.limit,
    pagination.search,
    month,
  ]);

  const getUserAttendances = useCallback(() => {
    if (viewMode === "day") {
      getDailyAttendance();
    } else {
      getMonthlyAttendance();
    }
  }, [viewMode, getDailyAttendance, getMonthlyAttendance]);

  useEffect(() => {
    if (viewMode === "day") {
      getDailyAttendance();
    }
  }, [viewMode, getDailyAttendance]);

  useEffect(() => {
    if (viewMode === "month") {
      getMonthlyAttendance();
    }
  }, [viewMode, getMonthlyAttendance]);

  const exportAttendanceExcel = async () => {
    try {
      await downloadAttendanceReportService({
        org_uuid: uuid,
        date_range: viewMode === "month" ? dateRangeFilter : undefined,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        search:
          (viewMode === "day"
            ? paginationDayAttendance.search
            : pagination.search) || undefined,
        date: viewMode === "day" ? dayjs(date).format("YYYY-MM-DD") : undefined,
      });
    } catch (error) {
      console.error(error);
    }
  };
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

  const onSubmit = (
    employee: AttendanceReportRow,
    status: AttendanceStatus,
    data?: UpdateTimeForm,
  ) => {
    if (employee.attendances[0]?.uuid) {
      dispatch(
        updateAttendanceAction({
          org_uuid: uuid,
          uuid: employee.attendances[0].uuid,
          status,
          check_in: data?.check_in || null,
          check_out: data?.check_out || null,
        }),
      ).then(() => {
        getUserAttendances();
      });
    } else {
      dispatch(
        createAttendanceAction({
          org_uuid: uuid,
          user_uuid: employee.user_id,
          status,
          check_in: data?.check_in || null,
          check_out: data?.check_out || null,
          date: dayjs(date).format("YYYY-MM-DD"),
        }),
      ).then(() => {
        getUserAttendances();
      });
    }
    setIsTimeModalOpen(false);
  };
  const onMarkAttendance = (
    employee: AttendanceReportRow,
    status: AttendanceStatus,
  ) => {
    setSelectedAttendance({
      ...employee,
      attendances: [
        {
          ...employee.attendances[0],
          status,
        },
        ...employee.attendances.slice(1),
      ],
    });

    form.reset({
      check_in: employee.attendances[0]?.check_in
        ? dayjs(
            formatTime(employee.attendances[0]?.check_in),
            "hh:mm A",
          ).format("HH:mm:ss")
        : "",
      check_out: employee.attendances[0]?.check_out
        ? dayjs(
            formatTime(employee.attendances[0]?.check_out),
            "hh:mm A",
          ).format("HH:mm:ss")
        : "",
    });

    if (
      status === AttendanceStatus.ABSENT ||
      status === AttendanceStatus.ON_LEAVE
    ) {
      onSubmit(
        {
          ...employee,
          attendances: [
            {
              ...employee.attendances[0],
              status,
            },
            ...employee.attendances.slice(1),
          ],
        },
        status,
        {
          check_in: "",
          check_out: "",
        },
      );
      return;
    }

    setIsTimeModalOpen(true);
  };

  return (
    <AdminDashboardLayout>
      <Charts
        loading={loading && !report?.daily_attendance_report}
        todayAttendance={todayAttendance}
        monthlyReportSummary={monthlyReportSummary}
        report={report}
        selectedDay={dayjs(date).format("YYYY-MM-DD")}
      />
      <Tabs
        value={viewMode}
        onValueChange={(value) => {
          (setViewMode(value as "month" | "day"),
            setPagination({ ...pagination, search: "" }),
            setPaginationDayAttendance({
              ...paginationDayAttendance,
              search: "",
            }));
        }}
      >
        <TabsList>
          <TabsTrigger value="day">Daily Attendance</TabsTrigger>
          <TabsTrigger value="month">Monthly Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="month">
          <DataTable
            data={monthData}
            columns={generateAttendanceColumns(month)}
            isLoading={loading}
            totalCount={report?.user_attendance_report?.count ?? 0}
            showPagination={true}
            pagination={pagination}
            onPaginationChange={(state) =>
              setPagination({ ...pagination, ...state })
            }
          >
            <div className=" flex justify-end gap-2">
              <MonthPicker
                value={month}
                onChange={(month) => {
                  setMonth(month);
                  setPagination({
                    ...pagination,
                    page: 1,
                  });
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Report Actions
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpenReportModal(true)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DataTable>
        </TabsContent>
        <ReportDownloadModal
          openReportModal={openReportModal}
          setOpenReportModal={setOpenReportModal}
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          exportAttendanceExcel={exportAttendanceExcel}
        ></ReportDownloadModal>
        <TabsContent value="day">
          <DataTable
            data={dayData}
            columns={attendanceColumns({
              onMarkAttendance,
              setSelectedAttendanceUser: setSelectedAttendance,
            })}
            isLoading={loading}
            totalCount={report?.day_wise_attendance_report?.count ?? 0}
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
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setPaginationDayAttendance({
                    ...paginationDayAttendance,
                    page: 1,
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="early_departure">
                    Early Departure
                  </SelectItem>
                </SelectContent>
              </Select>
              <DatePicker
                date={date}
                setDate={(date) => {
                  (setDate(date),
                    setPaginationDayAttendance({
                      ...paginationDayAttendance,
                      page: 1,
                    }));
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileSpreadsheet className="mr-4 h-4 w-4" />
                    Report Actions
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => exportAttendanceExcel()}>
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
        employee={selectedAttendance}
        onSubmit={onSubmit}
        isTimeModalOpen={isTimeModalOpen}
        setIsTimeModalOpen={setIsTimeModalOpen}
        form={form}
      />
    </AdminDashboardLayout>
  );
}
