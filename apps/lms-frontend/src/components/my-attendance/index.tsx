"use client";

import FaceDetection from "@/components/face-detection/face-detection";
import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Calendar,
  Dot,
  Loader2,
  Play,
  Square,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  checkInAction,
  checkOutAction,
  getUserAttendancesAction,
  getUserTodayAttendancesAction,
} from "@/features/attendances/attendances.action";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import AttendanceTable from "@/components/attendance-table";
import { Button } from "@/components/ui/button";
import { hasPermissions } from "@/lib/haspermissios";
import NoPermission from "@/shared/no-permission";
import { ConfirmationDialog } from "@/components/my-attendance/confimation-modal";
import {
  AttendanceDialog,
  AttendanceMode,
} from "@/components/my-attendance/attendence-modal";
import { Progress } from "../ui/progress";
import { toastError } from "@/shared/toast/toast-error";

const MyAttendance = () => {
  const dispatch = useAppDispatch();
  const orgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );
  const userUUID = useAppSelector(
    (state) => state.userSlice.currentUser?.user_id,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );
  const organizationSettings = useAppSelector(
    (state) => state.organizationsSlice.organizationSettings,
  );
  const userTodayAttendance = useAppSelector(
    (state) => state.attendancesSlice.attendance,
  );
  const userAttendance = useAppSelector(
    (state) => state.attendancesSlice.attendances,
  );
  const userAttendanceLoading = useAppSelector(
    (state) => state.attendancesSlice.loading,
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
  const [manualConfirmationOpen, setManualConfirmationOpen] =
    useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: "open" | "close" | "confirm";
    id: string | null;
  }>({ show: "close", id: null });

  const [faceVerified, setFaceVerified] = useState<boolean>(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const isOrganizationHolidayToday =
    userTodayAttendance?.status === AttendanceStatus.HOLIDAY;
  const isOnLeaveToday =
    userTodayAttendance?.status === AttendanceStatus.ON_LEAVE;

  const handleSetFaceVerified = useCallback((value: boolean) => {
    setFaceVerified(value);
  }, []);

  useEffect(() => {
    setIsCheckedIn(
      userTodayAttendance?.check_in !== null &&
        userTodayAttendance?.check_out === null,
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
    } else {
      await dispatch(
        checkOutAction({ org_uuid: orgUUID, user_uuid: userUUID }),
      );
    }
    setManualConfirmationOpen(false);
    setIsModalOpen(false);
    setAttendanceMode(null);
    setConfirmModal({ show: "close", id: null });
    dispatch(
      getUserAttendancesAction({
        org_uuid: orgUUID,
        user_uuid: userUUID,
        page: 1,
        limit: itemsPerPage,
        ...(dateRange.end_date && { date_range: dateRange }),
      }),
    );
    dispatch(
      getUserTodayAttendancesAction({ org_uuid: orgUUID, user_uuid: userUUID }),
    );
    setIsLoading(false);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleAttendanceClick = () => {
    if (isOrganizationHolidayToday) {
      toastError("You cannot check in or check on holiday.");
      return;
    }

    if (isOnLeaveToday) {
      toastError("You cannot check in or check out while you are on leave.");
      return;
    }
    if (organizationSettings?.attendance_method === OrgAttendanceMethod.DUAL) {
      setIsModalOpen(true);
    } else if (
      organizationSettings?.attendance_method === OrgAttendanceMethod.MANUAL
    ) {
      setManualConfirmationOpen(true);
    } else {
      setConfirmModal({ show: "open", id: null });
      setAttendanceMode(null);
    }
  };

  const totalPages = Math.ceil((userAttendance?.total || 0) / itemsPerPage);

  useEffect(() => {
    if (userUUID) {
      dispatch(
        getUserAttendancesAction({
          org_uuid: orgUUID,
          user_uuid: userUUID,
          page: currentPage,
          limit: itemsPerPage,
          ...(dateRange.end_date && dateRange.start_date && { date_range: dateRange }),
        }),
      );
    }
  }, [dateRange, currentPage]);

  useEffect(() => {
    if (userUUID) {
      dispatch(
        getUserTodayAttendancesAction({
          org_uuid: orgUUID,
          user_uuid: userUUID,
        }),
      );
    }
  }, [dateRange]);

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
        currentUser.email,
      ) ? (
        <div className="flex flex-col items-center">
          <div className="w-3/4 p-6">
            <div className="flex gap-6 mb-6">
              <div className="bg-card p-6 rounded-lg border border-border grid grid-cols-2 items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Dot
                      className="animate-pulse text-primary"
                      strokeWidth={5}
                    />
                    <h2 className="text-primary text-xs font-bold uppercase tracking-[0.2em]">
                      System Status: Live
                    </h2>
                  </div>

                  <span className="text-5xl text-primary tracking-tighter tabular-nums">
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </span>
                  <span className="text-primary text-sm tracking-tighter mt-1 flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {hasPermissions(
                  "user_attendance_management",
                  "update",
                  currentUserRolePermissions,
                  currentUser.email,
                ) && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                      Log your daily attendance. Ensure location services are
                      enabled for accurate check-ins.
                    </p>
                    <Button
                      variant={`${isCheckedIn ? "destructive" : "default"}`}
                      size={"lg"}
                      className={`font-bold`}
                      onClick={handleAttendanceClick}
                    >
                      {isCheckedIn ? (
                        <Square size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" />
                      )}
                      {isCheckedIn ? "Clock out" : "Clock in"}
                    </Button>
                    {isOrganizationHolidayToday && (
                      <p className="text-xs text-destructive">
                        Organization holiday today. Attendance marking is not
                        allowed.
                      </p>
                    )}
                    {isOnLeaveToday && (
                      <p className="text-xs text-destructive">
                        You are on leave today. Attendance marking is not
                        allowed.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-card rounded-lg border border-border p-6 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                      Monthly Efficiency
                    </h3>
                    <span className="text-3xl font-black tracking-tighter">
                      {getPercentage(
                        userAttendance.total_present_current_month,
                        userAttendance.total_present_current_month +
                          userAttendance.total_absent_current_month,
                      )}
                      <span className="text-sm ml-1">%</span>
                    </span>
                  </div>
                  <Progress
                    value={getPercentage(
                      userAttendance.total_present_current_month,
                      userAttendance.total_present_current_month +
                        userAttendance.total_absent_current_month,
                    )}
                  />
                </div>
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">
                      Present
                    </span>
                    <span className="text-sm font-bold">
                      {userAttendance.total_present_current_month} Days
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">
                      Absent
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {userAttendance.total_absent_current_month} Days
                    </span>
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
              expandedRowId={expandedRowId}
              setExpandedRowId={setExpandedRowId}
              noDataMessage={
                "We couldn't find any attendance logs for the selected criteria. Try adjusting your date range."
              }
            />
          </div>

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

          <ManualConfirmationDialog
            open={manualConfirmationOpen}
            onOpenChange={setManualConfirmationOpen}
            setAttendanceMode={setAttendanceMode}
            handleProcessAttendance={handleProcessAttendance}
            isCheckedIn={isCheckedIn}
            currentTime={currentTime}
            isLoading={isLoading}
          />

          <ConfirmationDialog
            title={!isCheckedIn ? "Check Out" : "Check In"}
            message={`Are you are sure you want to ${
              !isCheckedIn ? "Check-Out" : "Check-In"
            }`}
            confirmText="Confirm"
            disableConfirm={!faceVerified || isLoading}
            handleConfirmAction={() => handleProcessAttendance()}
            setConfirmModal={setConfirmModal}
            confirmModal={confirmModal}
            isFaceRegistered={Boolean(currentUser.image)}
          >
            <FaceDetection setVerified={handleSetFaceVerified} />
          </ConfirmationDialog>
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

export default MyAttendance;

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgAttendanceMethod } from "@/features/organizations/organizations.type";
interface ManualConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setAttendanceMode: (mode: AttendanceMode) => void;
  handleProcessAttendance: () => void;
  isCheckedIn: boolean;
  currentTime: Date;
  isLoading: boolean;
}

const ManualConfirmationDialog = ({
  open,
  onOpenChange,
  handleProcessAttendance,
  isCheckedIn,
  currentTime,
  isLoading,
}: ManualConfirmationDialogProps) => {
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
          <div className="p-4 border rounded-lg flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm">
              Manual marking is logged and may require approval from your
              manager if frequent.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Time Stamp</label>
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
        <DialogFooter>
          <Button onClick={handleProcessAttendance} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
