"use client";
import DataTable from "@/shared/table";
import { ChevronDown, Download, FileText, Upload } from "lucide-react";
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
  DropdownMenuSeparator,
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
import { ReportDownloadModal } from "./report-download-modal";
import { formatTime } from "@/utils/format-time";
import AdminDashboardLayout from "../layout";
import { DownloadAttendanceType } from "@/features/attendances/download/download.types";
import UploadAttendance from "./upload-attendance";
import RemarkDialog from "../payroll/components/attendance-reconciliation/remarks-dialog";
import { IPendingStatusChange } from "../payroll/components/attendance-reconciliation";
import { downloadAttendanceReportAction } from "@/features/attendances/download/download.action";
import { toastSuccess } from "@/shared/toast/toast-success";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";

export default function AdminDashboardAttendance() {
  const dispatch = useAppDispatch();
  const { report, loading } = useAppSelector((state) => state.attendancesSlice);
  const { uuid } = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization,
  );

  const [month, setMonth] = useState<string>(dayjs().format("YYYY-MM"));
  const [date, setDate] = useState<Date>(new Date());
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
    end_date: dayjs().format("YYYY-MM-DD"),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"month" | "day">("day");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceReportRow | null>(null);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchDayAttendance, setSearchDayAttendance] = useState("");

  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [paginationDayAttendance, setPaginationDayAttendance] = useState({
    page: 1,
    limit: 10,
  });
  const can = usePermissionCheck();
  const [remarkInput, setRemarkInput] = useState("");
  const [pendingStatusChange, setPendingStatusChange] =
    useState<IPendingStatusChange | null>(null);

  const closeRemarkDialog = () => {
    setPendingStatusChange(null);
    setRemarkInput("");
  };

  const submitRemarkDialog = async () => {
    if (!pendingStatusChange) return;
    const { onConfirm } = pendingStatusChange;
    closeRemarkDialog();
    await onConfirm(remarkInput.trim());
  };

  const monthData = report?.user_attendance_report
    ?.rows as AttendanceReportRow[];
  const dayData = report?.day_wise_attendance_report
    ?.rows as AttendanceReportRow[];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchChangeDayAttendance = (value: string) => {
    setSearchDayAttendance(value);
    setPaginationDayAttendance((prev) => ({ ...prev, page: 1 }));
  };

  const form = useForm<UpdateTimeForm>({
    resolver: zodResolver(updateTimeSchema),
    defaultValues: {
      check_in: null,
      check_out: null,
      status: AttendanceStatus.PRESENT,
      remarks: "",
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
        search: searchDayAttendance,
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
    searchDayAttendance,
    date,
    selectedStatus,
  ]);

  const getMonthlyAttendance = useCallback(() => {
    if (!uuid) return;
    dispatch(
      getAttendanceReportAction({
        page: pagination.page,
        search,
        limit: pagination.limit,
        org_uuid: uuid,
        month,
      }),
    );
  }, [dispatch, uuid, pagination.page, pagination.limit, search, month]);

  const getUserAttendances = useCallback(() => {
    if (viewMode === "day") {
      getDailyAttendance();
    } else {
      getMonthlyAttendance();
    }
  }, [viewMode, getDailyAttendance, getMonthlyAttendance]);

  useEffect(() => {
    if (
      viewMode === "day" &&
      can(PermissionTag.ATTENDANCE_MANAGEMENT, PermissionAction.REPORT)
    ) {
      getDailyAttendance();
    }
  }, [viewMode, getDailyAttendance]);

  useEffect(() => {
    if (
      viewMode === "month" &&
      can(PermissionTag.ATTENDANCE_MANAGEMENT, PermissionAction.REPORT)
    ) {
      getMonthlyAttendance();
    }
  }, [viewMode, getMonthlyAttendance]);

  const exportAttendanceExcel = async () => {
    try {
      await dispatch(
        downloadAttendanceReportAction({
          org_uuid: uuid,
          date_range: viewMode === "month" ? dateRangeFilter : undefined,
          status: selectedStatus === "all" ? undefined : selectedStatus,
          search:
            (viewMode === "day" ? searchDayAttendance : search) || undefined,
          date:
            viewMode === "day" ? dayjs(date).format("YYYY-MM-DD") : undefined,
          type:
            viewMode === "day"
              ? DownloadAttendanceType.DAILY_ATTENDANCE
              : DownloadAttendanceType.MONTHLY_ATTENDANCE,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = (
    employee: AttendanceReportRow,
    status: AttendanceStatus,
    data?: UpdateTimeForm,
    updatedAtDate: Date | string = new Date(date),
  ) => {
    if (employee.attendances[0]?.uuid) {
      dispatch(
        updateAttendanceAction({
          org_uuid: uuid,
          uuid: employee.attendances[0].uuid,
          status,
          check_in: data?.check_in || null,
          check_out: data?.check_out || null,
          remarks: data?.remarks || null,
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
          date: dayjs(updatedAtDate).format("YYYY-MM-DD"),
          remarks: data?.remarks || null,
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
      status,
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
      remarks: "",
    });
    if (
      status === AttendanceStatus.ABSENT ||
      status === AttendanceStatus.ON_LEAVE
    ) {
      form.reset({
        status,
        check_in: null,
        check_out: null,
        remarks: "",
      });
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
          setViewMode(value as "month" | "day");
          setSearch("");
          setSearchDayAttendance("");
          setPagination((prev) => ({ ...prev, page: 1 }));
          setPaginationDayAttendance((prev) => ({ ...prev, page: 1 }));
        }}
      >
        <TabsList>
          <TabsTrigger value="day">Daily Attendance</TabsTrigger>
          <TabsTrigger value="month">Monthly Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="month">
          <DataTable
            data={monthData}
            columns={generateAttendanceColumns(
              onMarkAttendance,
              setSelectedAttendance,
              setDate,
              month,
              can,
            )}
            hasPermission={can(
              PermissionTag.ATTENDANCE_MANAGEMENT,
              PermissionAction.REPORT,
            )}
            moduleName="Attendance Report"
            isLoading={loading}
            totalCount={report?.user_attendance_report?.count ?? 0}
            showPagination={true}
            pagination={pagination}
            onPaginationChange={(state) =>
              setPagination({ ...pagination, ...state })
            }
            searchValue={search}
            onSearchChange={handleSearchChange}
          >
            <MonthPicker
              value={month}
              onChange={(month) => {
                setMonth(month);
                setPagination({ ...pagination, page: 1 });
              }}
            />
            {can(
              PermissionTag.ATTENDANCE_MANAGEMENT,
              PermissionAction.REPORT,
            ) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="flex-1">
                  <Button variant="outline" className="group flex-1">
                    <FileText className="w-4 h-4 text-primary" />
                    Report Actions
                    <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpenReportModal(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Full Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </DataTable>
        </TabsContent>
        <ReportDownloadModal
          openReportModal={openReportModal}
          setOpenReportModal={setOpenReportModal}
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          exportAttendanceExcel={exportAttendanceExcel}
        />
        <TabsContent value="day">
          <DataTable
            data={dayData}
            columns={attendanceColumns({
              onMarkAttendance,
              setSelectedAttendanceUser: setSelectedAttendance,
              can,
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
            searchValue={searchDayAttendance}
            onSearchChange={handleSearchChangeDayAttendance}
            hasPermission={can(
              PermissionTag.ATTENDANCE_MANAGEMENT,
              PermissionAction.REPORT,
            )}
            moduleName="Attendance Report"
          >
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
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="early_departure">Early Departure</SelectItem>
              </SelectContent>
            </Select>

            <DatePicker
              date={date}
              setDate={(date) => {
                setDate(date as Date);
                setPaginationDayAttendance({
                  ...paginationDayAttendance,
                  page: 1,
                });
              }}
            />
            {can(
              PermissionTag.ATTENDANCE_MANAGEMENT,
              PermissionAction.REPORT,
            ) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="group">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="hidden sm:block">Report Actions</span>
                    <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground group-data-[state=open]:rotate-180 transition-transform hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {can(
                    PermissionTag.ATTENDANCE_MANAGEMENT,
                    PermissionAction.REPORT,
                  ) && (
                    <>
                      {" "}
                      <DropdownMenuItem onClick={exportAttendanceExcel}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Full Report
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />{" "}
                    </>
                  )}
                  {can(
                    PermissionTag.ATTENDANCE_MANAGEMENT,
                    PermissionAction.CREATE_BULK,
                  ) && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          fileInputRef?.current?.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Attendance Sheet
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = "/Daily Report Format.xlsx";
                          link.download = "Daily Report Format.xlsx";
                          link.click();
                          toastSuccess(
                            "Sample template downloaded successfully!",
                          );
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Sample Template
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </DataTable>
        </TabsContent>
      </Tabs>

      <RemarkDialog
        open={!!pendingStatusChange}
        date={pendingStatusChange?.date}
        status={pendingStatusChange?.status}
        remark={remarkInput}
        onRemarkChange={setRemarkInput}
        onOpenChange={(open) => {
          if (!open) closeRemarkDialog();
        }}
        onSubmit={submitRemarkDialog}
      />

      <UploadAttendance
        getUserAttendances={getUserAttendances}
        fileInputRef={fileInputRef}
        requestRemark={({ date, onConfirm }) =>
          setPendingStatusChange({
            date,
            status: AttendanceStatus.UPLOADED,
            onConfirm,
          })
        }
      />

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
