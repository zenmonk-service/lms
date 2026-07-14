"use client";
import { hasPermissions } from "@/lib/haspermissios";
import { useAppSelector } from "@/store";
import { useAttendanceButton } from "../../hooks/use-attendance-button";
import { AttendanceConfirmDialog } from "../attendance-confirm-modal";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  size?: "default" | "icon" | "icon-lg" | "icon-sm" | "lg" | "sm";
  className?: string;
}

export function AttendanceButton({ size = "lg", className }: Props) {
  const { currentUser } = useAppSelector((s) => s.userSlice);
  const { currentUserRolePermissions } = useAppSelector((s) => s.permissionSlice);

  const canUpdate = hasPermissions(
    "user_attendance_management",
    "update",
    currentUserRolePermissions,
    currentUser.email,
  );

  const {
    isCheckedIn,
    isOrganizationHolidayToday,
    isOnLeaveToday,
    isLoading,
    confirmOpen,
    setConfirmOpen,
    attendanceMethod,
    handleAttendanceClick,
    handleProcessAttendance,
  } = useAttendanceButton();

  function getAttendanceButtonState(isCheckedIn: boolean) {
    return isCheckedIn
      ? {
          label: "Check Out",
          icon: <Square size={18} fill="currentColor" />,
          variant: "destructive",
        }
      : {
          label: "Check In",
          icon: <Play size={18} fill="currentColor" />,
          variant: "default",
        };
  }

  return (
    <>
      {canUpdate && (
        <div className="flex flex-col">
          <Button
            variant={isCheckedIn ? "destructive" : "default"}
            size={size}
            className={cn("ml-auto w-fit", className)}
            onClick={handleAttendanceClick}
            disabled={isOrganizationHolidayToday || isOnLeaveToday || isLoading}
          >
            {isLoading ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <>
                {getAttendanceButtonState(isCheckedIn).icon}
                <span>{getAttendanceButtonState(isCheckedIn).label}</span>
              </>
            )}
          </Button>
          {isOrganizationHolidayToday && (
            <p className="text-xs text-destructive">
              Organization holiday today. Attendance marking is not allowed.
            </p>
          )}
          {isOnLeaveToday && (
            <p className="text-xs text-destructive">
              You are on leave today. Attendance marking is not allowed.
            </p>
          )}
        </div>
      )}
      <AttendanceConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        isCheckedIn={isCheckedIn}
        attendanceMethod={attendanceMethod!}
        isLoading={isLoading}
        onConfirm={handleProcessAttendance}
      />
    </>
  );
}
