import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Circle,
  CircleArrowOutUpRight,
  CircleCheck,
  CircleX,
  Clock,
  Clock3,
  LogOut,
  LucideIcon,
  Sun,
  TrendingUpIcon,
  XCircle,
} from "lucide-react";
import { DayStatus } from "@/features/organizations/organizations.types";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { LeaveRequestStatus } from "@/features/leave/leave.types";

export type BadgeVariant =
  | "outline"
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "recommended";

export type BadgeConfig = {
  text?: string;
  variant?: BadgeVariant;
  className?: string;
  badgeIcon?: LucideIcon;
  statusIcon?: LucideIcon;
  statusIconClassName?: string;
};

export const BADGE_CONFIG: Record<string, BadgeConfig> = {
  // Leave Types
  ["Sandwich & Club"]: {
    className: "border-transparent bg-purple-500 text-white dark:bg-purple-600",
  },
  ["Uploaded"]: {
    className: "border-transparent bg-cyan-500 text-white dark:bg-green-600",
  },
  Sandwich: {
    className: "border-transparent bg-orange-500 text-white dark:bg-orange-600",
  },
  Club: {
    className: "border-transparent bg-cyan-500 text-white dark:bg-cyan-600",
  },
  Standard: {
    className: "border-transparent bg-slate-600 text-white dark:bg-slate-700",
  },
  ["Negative Balance Allowed"]: {
    className:
      "border-transparent bg-emerald-500 text-white dark:bg-emerald-600",
  },

  // Accrual
  monthly: {
    className: "border-transparent bg-blue-500 text-white dark:bg-blue-600",
  },
  yearly: {
    className: "border-transparent bg-purple-500 text-white dark:bg-purple-600",
  },
  accrual: {
    className: "border-transparent bg-amber-500 text-white dark:bg-amber-600",
  },
  no_accrual: {
    className: "bg-secondary text-secondary-foreground border-border",
  },

  // Attendance
  [AttendanceStatus.PRESENT]: {
    className:
      "border-transparent bg-emerald-500 text-white dark:bg-emerald-600",
    badgeIcon: CheckCircle2,
  },
  [AttendanceStatus.ABSENT]: {
    className: "border-transparent bg-rose-500 text-white dark:bg-rose-600",
    badgeIcon: XCircle,
  },
  [AttendanceStatus.ON_LEAVE]: {
    className: "border-transparent bg-violet-500 text-white dark:bg-violet-600",
    badgeIcon: AlertCircle,
  },
  [AttendanceStatus.HOLIDAY]: {
    className: "border-transparent bg-sky-500 text-white dark:bg-sky-600",
    badgeIcon: Sun,
  },
  [AttendanceStatus.LATE]: {
    className: "border-transparent bg-amber-500 text-white dark:bg-amber-600",
    badgeIcon: Clock3,
  },
  [AttendanceStatus.EARLY_DEPARTURE]: {
    className: "border-transparent bg-orange-500 text-white dark:bg-orange-600",
    badgeIcon: LogOut,
  },
  [AttendanceStatus.ON_DUTY]: {
    className: "border-transparent bg-amber-500 text-white dark:bg-amber-600",
    badgeIcon: Briefcase,
  },
  [AttendanceStatus.HALF_DAY]: {
    className: "border-transparent bg-info text-white dark:bg-info/80",
    badgeIcon: Briefcase,
  },
  [AttendanceStatus.UPLOADED]: {
    className: "border-transparent bg-cyan-500 text-white dark:bg-cyan-600",
    badgeIcon: Clock,
  },

  // Leave Requests
  [LeaveRequestStatus.PENDING]: {
    variant: "outline",
    badgeIcon: Clock,
    statusIcon: Circle,
    statusIconClassName: "text-muted fill-background z-10",
  },
  [LeaveRequestStatus.APPROVED]: {
    text: "Approved",
    variant: "success",
    badgeIcon: CheckCircle2,
    statusIcon: CircleCheck,
    statusIconClassName: "fill-primary text-primary-foreground z-10",
  },
  [LeaveRequestStatus.REJECTED]: {
    text: "Rejected",
    variant: "destructive",
    badgeIcon: CircleX,
    statusIcon: CircleX,
    statusIconClassName: "fill-destructive text-primary-foreground z-10",
  },
  [LeaveRequestStatus.CANCELLED]: {
    text: "Cancelled",
    variant: "destructive",
    badgeIcon: XCircle,
    statusIcon: CircleX,
    statusIconClassName: "fill-destructive text-primary-foreground z-10",
  },
  [LeaveRequestStatus.RECOMMENDED]: {
    text: "Recommended",
    variant: "recommended",
    badgeIcon: TrendingUpIcon,
    statusIcon: CircleArrowOutUpRight,
    statusIconClassName: "text-muted fill-accent z-10",
  },

  // Day Status
  [DayStatus.ORGANIZATION_HOLIDAY]: {
    className: "border-transparent bg-success text-white dark:bg-success/80",
  },
  [DayStatus.PUBLIC_HOLIDAY]: {
    className: "border-transparent bg-error text-white dark:bg-error/80",
  },
  [DayStatus.SPECIAL_EVENT]: {
    className: "border-transparent bg-info text-white dark:bg-info/80",
  },
  [DayStatus.WORKING_DAY]: {
    className: "border-transparent bg-warning text-white dark:bg-warning/80",
  },
};