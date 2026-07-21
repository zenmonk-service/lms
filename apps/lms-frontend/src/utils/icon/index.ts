import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { LeaveRequestStatus } from "@/features/leave/leave.types";
import { ATTENDANCE_ICONS } from "./attendance.icons";
import { AUDIT_ICONS } from "./audit.icons";
import { getIcon } from "./get-icon";
import { LEAVE_ICONS } from "./leave.icons";

export const getLeaveIcon = (status: LeaveRequestStatus | null) => getIcon(status, LEAVE_ICONS);
export const getAttendanceIcon = (status: AttendanceStatus) => getIcon(status, ATTENDANCE_ICONS);
export const getAuditIcon = (action: string) => getIcon(action, AUDIT_ICONS, { className: "h-4 w-4" });
