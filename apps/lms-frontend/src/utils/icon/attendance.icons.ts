import {
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarOff,
  CalendarDays,
  Building2,
} from "lucide-react";
import { IconConfig } from "./get-icon";

export const ATTENDANCE_ICONS = {
  present: {
    icon: CheckCircle2,
    className: "h-4 w-4 text-green-500",
  },

  absent: {
    icon: XCircle,
    className: "h-4 w-4 text-red-500",
  },

  late: {
    icon: Clock3,
    className: "h-4 w-4 text-amber-500",
  },

  on_leave: {
    icon: CalendarOff,
    className: "h-4 w-4 text-blue-500",
  },

  holiday: {
    icon: CalendarDays,
    className: "h-4 w-4 text-purple-500",
  },

  org_holiday: {
    icon: Building2,
    className: "h-4 w-4 text-indigo-500",
  },

  week_off: {
    icon: CalendarOff,
    className: "h-4 w-4 text-gray-500",
  },

  half_day: {
    icon: Clock3,
    className: "h-4 w-4 text-yellow-500",
  },

  early_departure: {
    icon: Clock3,
    className: "h-4 w-4 text-orange-500",
  },
} satisfies Record<string, IconConfig>;
