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
          "bg-purple-50 text-purple-700 border-purple-100 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300",
          className,
        ),
        customVariant,
        icon,
      );
    case "Sandwich":
      return CustomBadge(
        text,
        cn(
          "bg-orange-50 text-orange-700 border-orange-100 dark:border-orange-500 dark:bg-orange-950 dark:text-orange-300",
          className,
        ),
        customVariant,
        icon,
      );
    case "Club":
      return CustomBadge(
        text,
        cn(
          "bg-cyan-50 text-cyan-700 border-cyan-100 dark:border-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
          className,
        ),
        customVariant,
        icon,
      );
    case "Standard":
      return CustomBadge(
        text,
        cn(
          "bg-slate-100 text-slate-800 border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300",
          className,
        ),
        customVariant,
        icon,
      );
    case "Negative Balance Allowed":
      return CustomBadge(
        text,
        cn(
          "bg-emerald-50 dark:bg-emerald-50/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-700",
          className,
        ),
        customVariant,
        icon,
      );
    case "monthly":
      return CustomBadge(
        text,
        cn(
          "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          className,
        ),
        customVariant,
        icon,
      );
    case "yearly":
      return CustomBadge(
        text,
        cn(
          "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          className,
        ),
        customVariant,
        icon,
      );
    case "accrual":
      return CustomBadge(
        text,
        cn(
          "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
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
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
          className,
        ),
        customVariant,
        <CheckCircle2 size={12} />,
      );
    case AttendanceStatus.ABSENT:
      return CustomBadge(
        text,
        cn(
          "bg-rose-50 text-rose-700 border-rose-200 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-300",
          className,
        ),
        customVariant,
        <XCircle size={12} />,
      );
    case AttendanceStatus.ON_LEAVE:
      return CustomBadge(
        text,
        cn(
          "bg-violet-50 text-violet-700 border-violet-200 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300",
          className,
        ),
        customVariant,
        <AlertCircle size={12} />,
      );
    case AttendanceStatus.HOLIDAY:
      return CustomBadge(
        text,
        cn(
          "bg-sky-50 text-sky-700 border-sky-200 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300",
          className,
        ),
        customVariant,
        <Sun size={12} />,
      );
    case AttendanceStatus.ON_DUTY:
      return CustomBadge(
        text,
        cn(
          "bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
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
