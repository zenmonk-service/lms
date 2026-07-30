// src/features/attendances/attendance-status.config.tsx
import {
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Palmtree,
  Sun,
} from "lucide-react";

import { AttendanceStatus } from "@/features/attendances/attendances.type";

interface AttendanceStatusMeta {
  label: string;
  icon: React.ReactNode;
}

export const ATTENDANCE_STATUS_META: Record<AttendanceStatus, AttendanceStatusMeta> = {
  [AttendanceStatus.PRESENT]: { label: "Present", icon: <CheckCircle className="h-4 w-4" /> },
  [AttendanceStatus.LATE]: { label: "Late", icon: <Clock className="h-4 w-4" /> },
  [AttendanceStatus.HALF_DAY]: { label: "Half Day", icon: <Sun className="h-4 w-4" /> },
  [AttendanceStatus.ON_LEAVE]: { label: "On Leave", icon: <Palmtree className="h-4 w-4" /> },
  [AttendanceStatus.EARLY_DEPARTURE]: { label: "Early Departure", icon: <LogOut className="h-4 w-4" /> },
  [AttendanceStatus.ABSENT]: { label: "Absent", icon: <XCircle className="h-4 w-4" /> },
  [AttendanceStatus.HOLIDAY]: { label: "Holiday", icon: <Sun className="h-4 w-4" /> },
  [AttendanceStatus.ON_DUTY]: { label: "On Duty", icon: <CheckCircle className="h-4 w-4" /> },
  [AttendanceStatus.WEEK_OFF]: { label: "Week Off", icon: <Sun className="h-4 w-4" /> },
  [AttendanceStatus.Uploaded]: { label: "Uploaded", icon: <CheckCircle className="h-4 w-4" /> },
};

export const MANUALLY_ASSIGNABLE_STATUSES = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
  AttendanceStatus.HALF_DAY,
  AttendanceStatus.ON_LEAVE,
  AttendanceStatus.EARLY_DEPARTURE,
  AttendanceStatus.ABSENT,
] as const;