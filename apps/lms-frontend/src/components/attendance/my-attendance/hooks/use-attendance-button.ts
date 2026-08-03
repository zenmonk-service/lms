import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { checkInAction } from "@/features/attendances/check-in/check-in.action";
import { checkOutAction } from "@/features/attendances/check-out/check-out.action";
import { getUserTodayAttendancesAction } from "@/features/attendances/get-user-today-attendances/get-user-today-attendances.action";
import { toastError } from "@/shared/toast/toast-error";
import { usePathname } from "next/navigation";
import { getUserAttendancesAction } from "@/features/attendances/get-user-attendances/get-user-attendances.action";

export function useAttendanceButton() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const userUUID = useAppSelector((s) => s.userSlice.currentUser?.user_id);
  const userTodayAttendance = useAppSelector((s) => s.attendancesSlice.attendance);
  const { organizationSettings, currentOrganization } = useAppSelector((s) => s.organizationsSlice);

  const orgUUID = currentOrganization?.uuid;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isCheckedIn = userTodayAttendance?.check_in !== null && userTodayAttendance?.check_out === null;
  const isOrganizationHolidayToday = userTodayAttendance?.status === AttendanceStatus.HOLIDAY;
  const isOnLeaveToday = userTodayAttendance?.status === AttendanceStatus.ON_LEAVE;

  const handleGettingTodayAttendance = async () => {
    setIsLoading(true);
    await dispatch(getUserTodayAttendancesAction({ org_uuid: orgUUID, user_uuid: userUUID }));
    setIsLoading(false);
  }

  useEffect(() => {
    handleGettingTodayAttendance();
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
    setConfirmOpen(true);
  };

  const handleProcessAttendance = async () => {
    setIsLoading(true);
    if (!isCheckedIn) {
      await dispatch(checkInAction({ org_uuid: orgUUID, user_uuid: userUUID }));
    } else {
      await dispatch(checkOutAction({ org_uuid: orgUUID, user_uuid: userUUID }));
    }
    setConfirmOpen(false);
    await dispatch(getUserTodayAttendancesAction({ org_uuid: orgUUID, user_uuid: userUUID }));
    if(pathname.split("/")[2] === "my-attendance") {
      await dispatch(getUserAttendancesAction({
        org_uuid: orgUUID,
        params: {
          user_uuid: userUUID,
          page: 1,
          limit: 10,
        }
      }));
    }
    setIsLoading(false);
  };

  return {
    isCheckedIn,
    isOrganizationHolidayToday,
    isOnLeaveToday,
    isLoading,
    confirmOpen,
    setConfirmOpen,
    attendanceMethod: organizationSettings?.attendance_method,
    handleAttendanceClick,
    handleProcessAttendance,
  };
}