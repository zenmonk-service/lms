"use client";

import { useAttendanceButton } from "../../hooks/use-attendance-button";
import { AttendanceConfirmDialog } from "../attendance-confirm-modal";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";

interface Props {
  size?: "default" | "icon" | "icon-lg" | "icon-sm" | "lg" | "sm";
  className?: string;
}
const timeToSeconds = (time: string) => {
  if (!time) return 0;
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return hours * 3600 + minutes * 60 + seconds;
};

export function AttendanceButton({ size = "lg", className }: Props) {
  const can = usePermissionCheck();
  const orgSetting = useAppSelector(
    (state) => state.userSlice.currentUser.role?.organization_setting,
  );
  const canUpdate = can(
    PermissionTag.USER_ATTENDANCE_MANAGEMENT,
    PermissionAction.UPDATE,
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

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const canCheckIn =
    orgSetting?.end_time != null &&
    currentSeconds <
      timeToSeconds(orgSetting.end_time) +
        Number(orgSetting?.flexible_time ?? 0) * 60;

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
      {canUpdate && (canCheckIn || isCheckedIn) && (
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
