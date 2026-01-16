"use client";
import FaceDetection from "@/components/face-detection/face-detection";
import { useState, useEffect, ReactNode } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  ArrowRightLeft,
  Camera,
  X,
  Keyboard,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  checkInAction,
  checkOutAction,
  getUserAttendancesAction,
  getUserTodayAttendancesAction,
} from "@/features/attendances/attendances.action";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { OrgAttendanceMethod } from "@/features/organizations/organizations.type";
import AttendanceTable from "@/components/attendance-table";
import { Button } from "@/components/ui/button";
import { hasPermissions } from "@/lib/haspermissios";
import NoPermission from "@/shared/no-permission";

type AttendanceMode = "manual" | "camera" | null;

const App = () => {
  const dispatch = useAppDispatch();
  const orgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid
  );
  const userUUID = useAppSelector(
    (state) => state.userSlice.currentUser?.user_id
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice
  );
  const organizationSettings = useAppSelector(
    (state) => state.organizationsSlice.organizationSettings
  );
  const userTodayAttendance = useAppSelector(
    (state) => state.attendancesSlice.attendance
  );
  const userAttendance = useAppSelector(
    (state) => state.attendancesSlice.attendances
  );
  const userAttendanceLoading = useAppSelector(
    (state) => state.attendancesSlice.loading
  );
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>(null);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: undefined,
    end_date: undefined,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  const [confirmModal, setConfirmModal] = useState<{
    show: "open" | "close" | "confirm";
    id: string | null;
  }>({ show: "close", id: null });

  const [faceVerified, setFaceVerified] = useState<boolean>(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  useEffect(() => {
    setIsCheckedIn(
      userTodayAttendance?.check_in !== null &&
        userTodayAttendance?.check_out === null
    );
  }, [userTodayAttendance]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleProcessAttendance = async () => {
    setIsLoading(true);
    if (!isCheckedIn) {
      await dispatch(checkInAction({ org_uuid: orgUUID, user_uuid: userUUID }));
      setIsModalOpen(false);
      setAttendanceMode(null);
    } else {
      await dispatch(
        checkOutAction({ org_uuid: orgUUID, user_uuid: userUUID })
      );
      setIsModalOpen(false);
      setAttendanceMode(null);
    }
    setConfirmModal({ show: "close", id: null });
    dispatch(
      getUserAttendancesAction({
        org_uuid: orgUUID,
        user_uuid: userUUID,
        page: 1,
        limit: itemsPerPage,
        ...(dateRange.end_date && { date_range: dateRange }),
      })
    );
    dispatch(
      getUserTodayAttendancesAction({ org_uuid: orgUUID, user_uuid: userUUID })
    );
    setIsLoading(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil((userAttendance?.total || 0) / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const base =
      "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit";
    switch (status) {
      case AttendanceStatus.PRESENT:
        return (
          <span
            className={`${base} text-emerald-700 bg-emerald-50 border border-emerald-100`}
          >
            <CheckCircle2 size={12} /> {status}
          </span>
        );
      case AttendanceStatus.ON_LEAVE:
        return (
          <span
            className={`${base} text-amber-700 bg-amber-50 border border-amber-100`}
          >
            <AlertCircle size={12} /> {status}
          </span>
        );
      case AttendanceStatus.ABSENT:
        return (
          <span
            className={`${base} text-rose-700 bg-rose-50 border border-rose-100`}
          >
            <XCircle size={12} /> {status}
          </span>
        );
      default:
        return (
          <span
            className={`${base} text-slate-700 bg-slate-50 border border-slate-100`}
          >
            {status}
          </span>
        );
    }
  };

  function changeUTCtoLocalTime(utcTime: string) {
    if (!utcTime) return "---";

    let date: Date;

    // Check if it's just a time string (HH:MM:SS format)
    if (/^\d{2}:\d{2}:\d{2}$/.test(utcTime)) {
      // Create a UTC date with today's date and the provided time
      const now = new Date();
      const [hours, minutes, seconds] = utcTime.split(":").map(Number);
      date = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          hours,
          minutes,
          seconds
        )
      );
    } else {
      // Parse as full date-time string
      date = new Date(utcTime);
    }

    // Check if the date is invalid
    if (isNaN(date.getTime())) return "---";

    // Convert UTC to local time
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  useEffect(() => {
    if (userUUID) {
      dispatch(
        getUserAttendancesAction({
          org_uuid: orgUUID,
          user_uuid: userUUID,
          page: currentPage,
          limit: itemsPerPage,
          ...(dateRange.end_date && { date_range: dateRange }),
        })
      );
    }
  }, [dateRange?.end_date, currentPage]);

  useEffect(() => {
    if (userUUID) {
      dispatch(
        getUserTodayAttendancesAction({
          org_uuid: orgUUID,
          user_uuid: userUUID,
        })
      );
    }
  }, [dateRange?.end_date]);

  function getPercentage(partialValue: number, totalValue: number) {
    if (totalValue === 0) return 0;
    return (partialValue / totalValue) * 100;
  }

  return (
    <>
      {hasPermissions(
        "user_attendance_management",
        "read",
        currentUserRolePermissions,
        currentUser.email
      ) ? (
        <div className="flex h-[calc(100vh-49px)] max-h-[calc(100vh-49px)] overflow-hidden font-sans">
          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border p-8 flex flex-col md:flex-row items-center justify-between group bg-card">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full -mr-32 -mt-32 opacity-50 blur-3xl group-hover:bg-primary/70 transition-colors duration-500" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <h2 className="text-primary text-xs font-bold uppercase tracking-[0.2em]">
                          System Status: Live
                        </h2>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-5xl text-primary  tracking-tighter tabular-nums">
                          {currentTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </span>
                        <span className="text-primary font-medium mt-1 flex items-center gap-2">
                          <Calendar size={14} className="text-primary" />
                          {currentTime.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {hasPermissions(
                      "attendance_management",
                      "update",
                      currentUserRolePermissions,
                      currentUser.email
                    ) && (
                      <Button
                        size={"lg"}
                        onClick={() => setIsModalOpen(true)}
                        className={`group flex items-center gap-3 px-10 py-4 rounded-sm font-black tracking-tight transition-all transform active:scale-95 shadow-xl ${
                          isCheckedIn
                            ? " bg-primary/50 text-primary-foreground border-2 border-primary hover:border-primary/80 shadow-primary/40"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/40"
                        }`}
                      >
                        {isCheckedIn ? (
                          <LogOut size={20} />
                        ) : (
                          <ArrowRightLeft size={20} />
                        )}
                        {isCheckedIn ? "CLOCK OUT" : "MARK ATTENDANCE"}
                      </Button>
                    )}
                  </div>

                  <div className=" bg-card rounded-2xl border  p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs  text-card-foreground uppercase tracking-[0.2em] mb-3 font-semibold">
                        Efficiency
                      </h3>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl  tracking-tighter text-secondary-foreground">
                          {getPercentage(
                            userAttendance.total_present_current_month,
                            userAttendance.total_present_current_month +
                              userAttendance.total_absent_current_month
                          )}
                          <span className="text-base text-secondary-foreground">
                            %
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-foreground h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(255,107,0,0.4)]"
                          style={{
                            width: `${getPercentage(userAttendance.total_present_current_month, userAttendance.total_present_current_month + userAttendance.total_absent_current_month)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <div className="flex-1 bg-card rounded-lg p-2 border border-border text-center">
                        <p className="text-[10px] font-bold text-card-foreground uppercase tracking-widest mb-1">
                          Present
                        </p>
                        <p className="text-base text-card-foreground">
                          {userAttendance.total_present_current_month}
                        </p>
                      </div>
                      <div className="flex-1 bg-card rounded-lg p-2 border border-border text-center">
                        <p className="text-[10px] font-bold text-card-foreground uppercase tracking-widest mb-1">
                          Absent
                        </p>
                        <p className="text-base font-black text-destructive">
                          {userAttendance.total_absent_current_month}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <AttendanceTable
                  setDateRange={setDateRange}
                  userAttendance={userAttendance}
                  userAttendanceLoading={userAttendanceLoading}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  changeUTCtoLocalTime={changeUTCtoLocalTime}
                  getStatusBadge={getStatusBadge}
                  expandedRowId={expandedRowId}
                  setExpandedRowId={setExpandedRowId}
                />
              </div>
            </div>
          </main>

          <AttendanceDialog
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            isCheckedIn={isCheckedIn}
            currentTime={currentTime}
            attendanceMode={attendanceMode}
            setAttendanceMode={setAttendanceMode}
            organizationSettings={organizationSettings}
            setConfirmModal={setConfirmModal}
            handleProcessAttendance={handleProcessAttendance}
            isLoading={isLoading}
          />

          <ConfirmationModal
            title={!isCheckedIn ? "Check Out" : "Check In"}
            message={`Are you are sure you want to ${
              !isCheckedIn ? "Check-Out" : "Check-In"
            }`}
            confirmText="Confirm"
            disableConfirm={!faceVerified || isLoading}
            handleConfirmAction={() => handleProcessAttendance()}
            setConfirmModal={setConfirmModal}
            confirmModal={confirmModal}
          >
            <FaceDetection setVerified={(value) => setFaceVerified(value)} />
          </ConfirmationModal>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-49px)] max-h-[calc(100vh-49px)] overflow-hidden font-sans">
          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex p-6 w-full">
              <NoPermission moduleName="Attendance" />
            </div>
          </main>
        </div>
      )}
    </>
  );
};

interface confirmModalState {
  id: string | null;
  show: "open" | "close" | "confirm";
}
interface ConfirmationModalProps {
  title: string;
  message?: string | ReactNode;
  loading?: boolean;
  confirmText: string;
  confirmModal: confirmModalState;
  setConfirmModal: React.Dispatch<React.SetStateAction<confirmModalState>>;
  handleConfirmAction: () => void;
  type?: string;
  children?: ReactNode;
  disableConfirm?: boolean;
}

export function ConfirmationModal(props: ConfirmationModalProps) {
  const {
    title,
    message,
    loading,
    confirmText,
    confirmModal,
    setConfirmModal,
    handleConfirmAction,
    type,
    children,
    disableConfirm,
  } = props;

  const handleCancel = () => {
    setConfirmModal((prevState) => ({
      ...prevState,
      id: null,
      show: "close",
    }));
  };

  return (
    <AlertDialog open={confirmModal?.show === "open"}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {children && (
            <div className="flex justify-center py-4">{children}</div>
          )}
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={disableConfirm}
            onClick={handleConfirmAction}
          >
            {disableConfirm ? (
              <Loader2 className="animate-spin" />
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCheckedIn: boolean;
  currentTime: Date;
  attendanceMode: AttendanceMode;
  setAttendanceMode: (mode: AttendanceMode) => void;
  organizationSettings: any;
  setConfirmModal: (modal: {
    show: "open" | "close" | "confirm";
    id: string | null;
  }) => void;
  handleProcessAttendance: () => void;
  isLoading: boolean;
}

function AttendanceDialog({
  open,
  onOpenChange,
  isCheckedIn,
  currentTime,
  attendanceMode,
  setAttendanceMode,
  organizationSettings,
  setConfirmModal,
  handleProcessAttendance,
  isLoading,
}: AttendanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCheckedIn ? "Confirm Clock Out" : "Mark Your Attendance"}
          </DialogTitle>
          <DialogDescription>
            {currentTime.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}{" "}
            •{" "}
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!attendanceMode ? (
            <div className="flex gap-4">
              {organizationSettings?.attendance_method !==
                OrgAttendanceMethod.MANUAL && (
                <Button
                  variant="outline"
                  className="flex-1 flex-col h-auto py-8"
                  onClick={() => {
                    setConfirmModal({ show: "open", id: null });
                    setAttendanceMode(null);
                    onOpenChange(false);
                  }}
                >
                  <div className="bg-card p-2 rounded-lg">
                    <Camera className="w-8! h-8!" />
                  </div>
                  <span className="mt-2 font-semibold">Camera / AI</span>
                </Button>
              )}
              {organizationSettings?.attendance_method !==
                OrgAttendanceMethod.FACE && (
                <Button
                  variant="outline"
                  className="flex-1 flex-col h-auto py-8"
                  onClick={() => setAttendanceMode("manual")}
                >
                  <div className="bg-card p-2 rounded-lg">
                    <Keyboard className="w-8! h-8!" />
                  </div>
                  <span className="mt-2 font-semibold">Manual Entry</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-sm">
                  Manual marking is logged and may require approval from your
                  manager if frequent.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Current Time Stamp
                </label>
                <div className="w-full p-4 border rounded-lg text-lg font-mono">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {attendanceMode && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceMode(null)}>
              Back
            </Button>
            <Button onClick={handleProcessAttendance} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default App;
