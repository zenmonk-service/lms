
import {
  Building2,
  CalendarDays,
  CalendarOff,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";


export const ATTENDANCE_STATUS_ICON_MAP = {
  present: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  absent: <XCircle className="h-4 w-4 text-red-500" />,
  late: <Clock3 className="h-4 w-4 text-amber-500" />,
  on_leave: <CalendarOff className="h-4 w-4 text-blue-500" />,
  holiday: <CalendarDays className="h-4 w-4 text-purple-500" />,
  org_holiday: <Building2 className="h-4 w-4 text-indigo-500" />,
  week_off: <CalendarOff className="h-4 w-4 text-gray-500" />,
  on_duty: <CalendarDays className="h-4 w-4 text-teal-500" />,
  half_day: <Clock3 className="h-4 w-4 text-yellow-500" />,
  early_departure: <Clock3 className="h-4 w-4 text-orange-500" />,
  short_leave: <CalendarOff className="h-4 w-4 text-cyan-500" />,
} as const;