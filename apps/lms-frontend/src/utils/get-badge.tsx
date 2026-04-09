import { Badge } from "@/components/ui/badge";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { LeaveRequestStatus } from "@/features/leave-requests/leave-requests.types";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  CircleX,
  Clock,
  Sun,
  XCircle,
  TrendingUpIcon,
  Circle,
  CircleCheck,
  CircleArrowOutUpRight,
} from "lucide-react";

const CustomBadge = (
  children: React.ReactNode,
  className?: string,
  customVariant?:
    | "outline"
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "recommended",
  icon?: React.ReactNode,
) => {
  return (
    <Badge
      variant={customVariant || "outline"}
      className={cn("rounded-sm", className)}
    >
      {icon}
      {children}
    </Badge>
  );
};

export const getBadge = (
  value: string,
  text: string,
  icon?: React.ReactNode,
  customVariant?:
    | "outline"
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "recommended",
  className?: string,
) => {
  if (!value) return null;
  switch (value) {
    case "Sandwich & Club":
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-purple-500 text-white dark:bg-purple-600",
          className,
        ),
        customVariant,
        icon,
      );
    case "Sandwich":
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-orange-500 text-white dark:bg-orange-600",
          className,
        ),
        customVariant,
        icon,
      );
    case "Club":
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-cyan-500 text-white dark:bg-cyan-600",
          className,
        ),
        customVariant,
        icon,
      );
    case "Standard":
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-slate-600 text-white dark:bg-slate-700",
          className,
        ),
        customVariant,
        icon,
      );
    case "Negative Balance Allowed":
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-emerald-500 text-white dark:bg-emerald-600",
          className,
        ),
        customVariant,
        icon,
      );
    case "monthly":
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-blue-500 text-white dark:bg-blue-600",
          className,
        ),
        customVariant,
        icon,
      );
    case "yearly":
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-purple-500 text-white dark:bg-purple-600",
          className,
        ),
        customVariant,
        icon,
      );
    case "accrual":
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-amber-500 text-white dark:bg-amber-600",
          className,
        ),
        customVariant,
        icon,
      );
    case "no_accrual":
      return CustomBadge(
        text,
        cn("bg-secondary text-secondary-foreground border-border", className),
        customVariant,
        icon,
      );
    case AttendanceStatus.PRESENT:
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-emerald-500 text-white dark:bg-emerald-600",
          className,
        ),
        customVariant,
        <CheckCircle2 size={12} />,
      );
    case AttendanceStatus.ABSENT:
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-rose-500 text-white dark:bg-rose-600",
          className,
        ),
        customVariant,
        <XCircle size={12} />,
      );
    case AttendanceStatus.ON_LEAVE:
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-violet-500 text-white dark:bg-violet-600",
          className,
        ),
        customVariant,
        <AlertCircle size={12} />,
      );
    case AttendanceStatus.HOLIDAY:
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-sky-500 text-white dark:bg-sky-600",
          className,
        ),
        customVariant,
        <Sun size={12} />,
      );
    case AttendanceStatus.ON_DUTY:
      return CustomBadge(
        text,
        cn(
          "border-transparent bg-amber-500 text-white dark:bg-amber-600",
          className,
        ),
        customVariant,
        <Briefcase size={12} />,
      );
    case LeaveRequestStatus.PENDING:
      return CustomBadge(
        text,
        cn("", className),
        "outline",
        <Clock size={12} />,
      );
    case LeaveRequestStatus.APPROVED:
      return CustomBadge(
        text,
        cn("", className),
        "success",
        <CheckCircle2 size={12} />,
      );
    case LeaveRequestStatus.REJECTED:
      return CustomBadge(
        text,
        cn("", className),
        "destructive",
        <CircleX size={12} />,
      );
    case LeaveRequestStatus.CANCELLED:
      return CustomBadge(
        text,
        cn("", className),
        "destructive",
        <XCircle size={12} />,
      );
    case LeaveRequestStatus.RECOMMENDED:
      return CustomBadge(
        text,
        cn("", className),
        "recommended",
        <TrendingUpIcon size={12} />,
      );
    case "default":
      return CustomBadge(text, cn("", className), customVariant, icon);
    default:
      return CustomBadge(text, cn("", className), customVariant, icon);
  }
};
export function getIcon(status: LeaveRequestStatus | null) {
  switch (status) {
    case null:
      return <Circle size={18} className="text-muted fill-background z-10" />;
    case LeaveRequestStatus.APPROVED:
      return (
        <CircleCheck
          size={18}
          className="fill-primary z-10 text-primary-foreground"
        />
      );
    case LeaveRequestStatus.REJECTED:
      return (
        <CircleX
          size={18}
          className="fill-destructive z-10 text-primary-foreground"
        />
      );
    case LeaveRequestStatus.RECOMMENDED:
      return (
        <CircleArrowOutUpRight
          size={18}
          className="text-muted fill-accent z-10"
        />
      );
    case LeaveRequestStatus.CANCELLED:
      return (
        <CircleX
          size={18}
          className="fill-destructive z-10 text-primary-foreground"
        />
      );
    default:
      return null;
  }
}

export function getStatusBadge(status: LeaveRequestStatus) {
  switch (status) {
    case LeaveRequestStatus.APPROVED:
      return getBadge(status, "Approved", getIcon(status), "success");
    case LeaveRequestStatus.REJECTED:
      return getBadge(status, "Rejected", getIcon(status), "destructive");
    case LeaveRequestStatus.RECOMMENDED:
      return getBadge(status, "Recommended", getIcon(status), "recommended");
    case LeaveRequestStatus.CANCELLED:
      return getBadge(status, "Cancelled", getIcon(status), "destructive");
    default:
      return getBadge(status, status, getIcon(status), "secondary");
  }
}
