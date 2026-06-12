"use client";
import DataTable from "@/shared/table";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarOff,
  CalendarDays,
  Building2,
  ChartNoAxesCombined,
  UserCheck,
  UserMinus,
  Plane,
} from "lucide-react";

import { ColumnDef } from "@tanstack/react-table";

import dayjs from "dayjs";
import { Attendance } from "@/features/attendances/attendances.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
interface CustomTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly payload: { readonly late: string; readonly month: string;  readonly present: string;  readonly onLeave: string };
  }>;
}

function CustomBarTooltip({ active, payload }: Readonly<CustomTooltipProps>) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background p-2 text-xs font-medium shadow-md">
      <p>{` ${data.present} Present, ${data.onLeave} On Leave, ${data.late} Late`}</p>
    </div>
  );
}

interface CustomPieTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly payload: {
      readonly name: string;
      readonly value: number;
      readonly color?: string;
    };
  }>;
  readonly total?: number;
}
function CustomPieTooltip({
  active,
  payload,
  total = 0,
}: Readonly<CustomPieTooltipProps>) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const data = payload[0].payload;
  const percentage = total > 0 ? (data.value / total) * 100 : 0;
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-xs shadow-lg">
      <p className="mb-1 font-bold text-foreground">{data.name}</p>
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: data.color || "hsl(var(--foreground))" }}
        />
        <span className="text-muted-foreground">{data.value} employees</span>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {percentage.toFixed(1)}% of total
      </p>
    </div>
  );
}

const ATTENDANCE_COLORS = {
  present: "var(--chart-1)",
  absent: "var(--chart-2)",
  on_leave: "var(--chart-3)",
  late: "var(--chart-4)",
};
export default function Dashboard() {
  const data = [
    {
      user_uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: "Ankit",
      avatar_url:
        "https://cdn.pixabay.com/photo/2016/11/21/06/53/beautiful-natural-image-1844362_640.jpg",
      attendances: [
        {
          date: "2026-06-01",
          status: "absent",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-02",
          status: "present",
          check_in: "09:02:00",
          check_out: "18:01:00",
          working_hours: 8.98,
        },
        {
          date: "2026-06-03",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:50:00",
          working_hours: 8.87,
        },
        {
          date: "2026-06-04",
          status: "present",
          check_in: "09:10:00",
          check_out: "18:05:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-05",
          status: "present",
          check_in: "08:50:00",
          check_out: "17:40:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-06",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-07",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-08",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-09",
          status: "present",
          check_in: "08:57:00",
          check_out: "17:55:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-10",
          status: "on_leave",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-11",
          status: "present",
          check_in: "09:05:00",
          check_out: "18:10:00",
          working_hours: 9.08,
        },
        {
          date: "2026-06-12",
          status: "present",
          check_in: "09:01:00",
          check_out: "17:58:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-13",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-14",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-15",
          status: "present",
          check_in: "08:53:00",
          check_out: "17:48:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-16",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:03:00",
          working_hours: 9.05,
        },
        {
          date: "2026-06-17",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:56:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-18",
          status: "absent",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-19",
          status: "present",
          check_in: "09:03:00",
          check_out: "18:00:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-20",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-21",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-22",
          status: "present",
          check_in: "08:56:00",
          check_out: "17:52:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-23",
          status: "present",
          check_in: "09:04:00",
          check_out: "18:02:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-24",
          status: "holiday",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-25",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-26",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:54:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-27",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-28",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-29",
          status: "present",
          check_in: "09:01:00",
          check_out: "18:05:00",
          working_hours: 9.07,
        },
        {
          date: "2026-06-30",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:57:00",
          working_hours: 8.97,
        },
      ],
    },
    {
      user_uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: "Ankit",
      avatar_url:
        "https://cdn.pixabay.com/photo/2016/11/21/06/53/beautiful-natural-image-1844362_640.jpg",
      attendances: [
        {
          date: "2026-06-01",
          status: "present",
          check_in: "08:55:00",
          check_out: "17:45:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-02",
          status: "present",
          check_in: "09:02:00",
          check_out: "18:01:00",
          working_hours: 8.98,
        },
        {
          date: "2026-06-03",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:50:00",
          working_hours: 8.87,
        },
        {
          date: "2026-06-04",
          status: "present",
          check_in: "09:10:00",
          check_out: "18:05:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-05",
          status: "present",
          check_in: "08:50:00",
          check_out: "17:40:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-06",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-07",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-08",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-09",
          status: "present",
          check_in: "08:57:00",
          check_out: "17:55:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-10",
          status: "on_leave",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-11",
          status: "present",
          check_in: "09:05:00",
          check_out: "18:10:00",
          working_hours: 9.08,
        },
        {
          date: "2026-06-12",
          status: "present",
          check_in: "09:01:00",
          check_out: "17:58:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-13",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-14",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-15",
          status: "present",
          check_in: "08:53:00",
          check_out: "17:48:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-16",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:03:00",
          working_hours: 9.05,
        },
        {
          date: "2026-06-17",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:56:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-18",
          status: "absent",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-19",
          status: "present",
          check_in: "09:03:00",
          check_out: "18:00:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-20",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-21",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-22",
          status: "present",
          check_in: "08:56:00",
          check_out: "17:52:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-23",
          status: "present",
          check_in: "09:04:00",
          check_out: "18:02:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-24",
          status: "holiday",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-25",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-26",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:54:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-27",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-28",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-29",
          status: "present",
          check_in: "09:01:00",
          check_out: "18:05:00",
          working_hours: 9.07,
        },
        {
          date: "2026-06-30",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:57:00",
          working_hours: 8.97,
        },
      ],
    },
    {
      user_uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: "Ankit",
      avatar_url:
        "https://cdn.pixabay.com/photo/2016/11/21/06/53/beautiful-natural-image-1844362_640.jpg",
      attendances: [
        {
          date: "2026-06-01",
          status: "present",
          check_in: "08:55:00",
          check_out: "17:45:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-02",
          status: "present",
          check_in: "09:02:00",
          check_out: "18:01:00",
          working_hours: 8.98,
        },
        {
          date: "2026-06-03",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:50:00",
          working_hours: 8.87,
        },
        {
          date: "2026-06-04",
          status: "present",
          check_in: "09:10:00",
          check_out: "18:05:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-05",
          status: "present",
          check_in: "08:50:00",
          check_out: "17:40:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-06",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-07",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-08",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-09",
          status: "present",
          check_in: "08:57:00",
          check_out: "17:55:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-10",
          status: "on_leave",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-11",
          status: "present",
          check_in: "09:05:00",
          check_out: "18:10:00",
          working_hours: 9.08,
        },
        {
          date: "2026-06-12",
          status: "present",
          check_in: "09:01:00",
          check_out: "17:58:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-13",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-14",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-15",
          status: "present",
          check_in: "08:53:00",
          check_out: "17:48:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-16",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:03:00",
          working_hours: 9.05,
        },
        {
          date: "2026-06-17",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:56:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-18",
          status: "absent",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-19",
          status: "present",
          check_in: "09:03:00",
          check_out: "18:00:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-20",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-21",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-22",
          status: "present",
          check_in: "08:56:00",
          check_out: "17:52:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-23",
          status: "present",
          check_in: "09:04:00",
          check_out: "18:02:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-24",
          status: "holiday",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-25",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-26",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:54:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-27",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-28",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-29",
          status: "present",
          check_in: "09:01:00",
          check_out: "18:05:00",
          working_hours: 9.07,
        },
        {
          date: "2026-06-30",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:57:00",
          working_hours: 8.97,
        },
      ],
    },
    {
      user_uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: "Ankit",
      avatar_url:
        "https://cdn.pixabay.com/photo/2016/11/21/06/53/beautiful-natural-image-1844362_640.jpg",
      attendances: [
        {
          date: "2026-06-01",
          status: "present",
          check_in: "08:55:00",
          check_out: "17:45:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-02",
          status: "present",
          check_in: "09:02:00",
          check_out: "18:01:00",
          working_hours: 8.98,
        },
        {
          date: "2026-06-03",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:50:00",
          working_hours: 8.87,
        },
        {
          date: "2026-06-04",
          status: "present",
          check_in: "09:10:00",
          check_out: "18:05:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-05",
          status: "present",
          check_in: "08:50:00",
          check_out: "17:40:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-06",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-07",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-08",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-09",
          status: "present",
          check_in: "08:57:00",
          check_out: "17:55:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-10",
          status: "on_leave",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-11",
          status: "present",
          check_in: "09:05:00",
          check_out: "18:10:00",
          working_hours: 9.08,
        },
        {
          date: "2026-06-12",
          status: "present",
          check_in: "09:01:00",
          check_out: "17:58:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-13",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-14",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-15",
          status: "present",
          check_in: "08:53:00",
          check_out: "17:48:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-16",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:03:00",
          working_hours: 9.05,
        },
        {
          date: "2026-06-17",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:56:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-18",
          status: "absent",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-19",
          status: "present",
          check_in: "09:03:00",
          check_out: "18:00:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-20",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-21",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-22",
          status: "present",
          check_in: "08:56:00",
          check_out: "17:52:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-23",
          status: "present",
          check_in: "09:04:00",
          check_out: "18:02:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-24",
          status: "holiday",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-25",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-26",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:54:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-27",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-28",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-29",
          status: "present",
          check_in: "09:01:00",
          check_out: "18:05:00",
          working_hours: 9.07,
        },
        {
          date: "2026-06-30",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:57:00",
          working_hours: 8.97,
        },
      ],
    },
    {
      user_uuid: "123e4567-e89b-12d3-a456-426614174000",
      name: "Ankit",
      avatar_url:
        "https://cdn.pixabay.com/photo/2016/11/21/06/53/beautiful-natural-image-1844362_640.jpg",
      attendances: [
        {
          date: "2026-06-01",
          status: "present",
          check_in: "08:55:00",
          check_out: "17:45:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-02",
          status: "present",
          check_in: "09:02:00",
          check_out: "18:01:00",
          working_hours: 8.98,
        },
        {
          date: "2026-06-03",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:50:00",
          working_hours: 8.87,
        },
        {
          date: "2026-06-04",
          status: "present",
          check_in: "09:10:00",
          check_out: "18:05:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-05",
          status: "present",
          check_in: "08:50:00",
          check_out: "17:40:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-06",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-07",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-08",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-09",
          status: "present",
          check_in: "08:57:00",
          check_out: "17:55:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-10",
          status: "on_leave",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-11",
          status: "present",
          check_in: "09:05:00",
          check_out: "18:10:00",
          working_hours: 9.08,
        },
        {
          date: "2026-06-12",
          status: "present",
          check_in: "09:01:00",
          check_out: "17:58:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-13",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-14",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-15",
          status: "present",
          check_in: "08:53:00",
          check_out: "17:48:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-16",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:03:00",
          working_hours: 9.05,
        },
        {
          date: "2026-06-17",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:56:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-18",
          status: "absent",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-19",
          status: "present",
          check_in: "09:03:00",
          check_out: "18:00:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-20",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-21",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-22",
          status: "present",
          check_in: "08:56:00",
          check_out: "17:52:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-23",
          status: "present",
          check_in: "09:04:00",
          check_out: "18:02:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-24",
          status: "holiday",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-25",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-26",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:54:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-27",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-28",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-29",
          status: "present",
          check_in: "09:01:00",
          check_out: "18:05:00",
          working_hours: 9.07,
        },
        {
          date: "2026-06-30",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:57:00",
          working_hours: 8.97,
        },
      ],
    },
    {
      user_uuid: "987fcdeb-51a2-43d1-b789-123456789abc",
      name: "Rahul",
      avatar_url:
        "https://cdn.pixabay.com/photo/2016/11/21/06/53/beautiful-natural-image-1844362_640.jpg",
      attendances: [
        {
          date: "2026-06-01",
          status: "present",
          check_in: "08:55:00",
          check_out: "17:45:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-02",
          status: "present",
          check_in: "09:02:00",
          check_out: "18:01:00",
          working_hours: 8.98,
        },
        {
          date: "2026-06-03",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:50:00",
          working_hours: 8.87,
        },
        {
          date: "2026-06-04",
          status: "present",
          check_in: "09:10:00",
          check_out: "18:05:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-05",
          status: "present",
          check_in: "08:50:00",
          check_out: "17:40:00",
          working_hours: 8.83,
        },
        {
          date: "2026-06-06",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-07",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-08",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-09",
          status: "present",
          check_in: "08:57:00",
          check_out: "17:55:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-10",
          status: "on_leave",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-11",
          status: "present",
          check_in: "09:05:00",
          check_out: "18:10:00",
          working_hours: 9.08,
        },
        {
          date: "2026-06-12",
          status: "present",
          check_in: "09:01:00",
          check_out: "17:58:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-13",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-14",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-15",
          status: "present",
          check_in: "08:53:00",
          check_out: "17:48:00",
          working_hours: 8.92,
        },
        {
          date: "2026-06-16",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:03:00",
          working_hours: 9.05,
        },
        {
          date: "2026-06-17",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:56:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-18",
          status: "absent",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-19",
          status: "present",
          check_in: "09:03:00",
          check_out: "18:00:00",
          working_hours: 8.95,
        },
        {
          date: "2026-06-20",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-21",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-22",
          status: "present",
          check_in: "08:56:00",
          check_out: "17:52:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-23",
          status: "present",
          check_in: "09:04:00",
          check_out: "18:02:00",
          working_hours: 8.97,
        },
        {
          date: "2026-06-24",
          status: "holiday",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-25",
          status: "present",
          check_in: "09:00:00",
          check_out: "18:00:00",
          working_hours: 9,
        },
        {
          date: "2026-06-26",
          status: "present",
          check_in: "08:58:00",
          check_out: "17:54:00",
          working_hours: 8.93,
        },
        {
          date: "2026-06-27",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-28",
          status: "week_off",
          check_in: null,
          check_out: null,
          working_hours: 0,
        },
        {
          date: "2026-06-29",
          status: "present",
          check_in: "09:01:00",
          check_out: "18:05:00",
          working_hours: 9.07,
        },
        {
          date: "2026-06-30",
          status: "present",
          check_in: "08:59:00",
          check_out: "17:57:00",
          working_hours: 8.97,
        },
      ],
    },
  ];
  const ATTENDANCE_STATUS_ICON_MAP = {
    present: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    absent: <XCircle className="h-4 w-4 text-red-500" />,
    late: <Clock3 className="h-4 w-4 text-amber-500" />,
    leave: <CalendarOff className="h-4 w-4 text-blue-500" />,
    holiday: <CalendarDays className="h-4 w-4 text-purple-500" />,
    org_holiday: <Building2 className="h-4 w-4 text-indigo-500" />,
  } as const;

  const generateAttendanceColumns = (month: string) => {
    const daysInMonth = dayjs(month).daysInMonth();

    const dayColumns: ColumnDef<any>[] = Array.from(
      { length: daysInMonth },
      (_, index) => {
        const day = index + 1;

        return {
          id: `day_${day}`,
          header: () => <div className="flex justify-center">{day}</div>,
          cell: ({ row }) => {
            const attendance = row.original.attendances.find(
              (a: Attendance) => dayjs(a.date).date() === day,
            );

            if (!attendance) {
              return <div className="text-center">-</div>;
            }

            return (
              <div className="flex justify-center">
                {ATTENDANCE_STATUS_ICON_MAP[
                  attendance.status as keyof typeof ATTENDANCE_STATUS_ICON_MAP
                ] ?? "-"}
              </div>
            );
          },
        };
      },
    );

    return [
      {
        accessorKey: "name",
        header: () => (
          <div className="text-center font-semibold">Employee Name</div>
        ),
        cell: ({ row }) => {
          const employee = row.original;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={employee?.avatar_url} alt={employee?.name} />
                <AvatarFallback>
                  {employee?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <span className="font-medium">{employee?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {employee?.employee_code}
                </span>
              </div>
            </div>
          );
        },
      },
      ...dayColumns,
      {
        id: "present_days",
        header: () => <div className="text-center">Present</div>,
        cell: ({ row }) => (
          <div className="text-center">
            {
              row.original.attendances.filter(
                (a: Attendance) => a.status === "present",
              ).length
            }
          </div>
        ),
      },
      {
        id: "absent_days",
        header: () => <div className="text-center">Absent</div>,
        cell: ({ row }) => (
          <div className="text-center">
            {
              row.original.attendances.filter(
                (a: Attendance) => a.status === "absent",
              ).length
            }
          </div>
        ),
      },
      {
        id: "leave_days",
        header: () => <div className="text-center">Leave</div>,
        cell: ({ row }) => (
          <div className="text-center">
            {
              row.original.attendances.filter(
                (a: Attendance) => a.status === "on_leave",
              ).length
            }
          </div>
        ),
      },
      {
        id: "working_hours",
        header: () => <div className="text-center">Hours</div>,
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.attendances.reduce(
              (sum: number, a: Attendance) =>
                sum + (Number(a.affected_hours) || 0),
              0,
            )}
          </div>
        ),
      },
    ];
  };

  const datas = [
    { name: "Present", value: 95, color: ATTENDANCE_COLORS.present },
    { name: "Absent", value: 15, color: ATTENDANCE_COLORS.absent },
    { name: "On Leave", value: 10, color: ATTENDANCE_COLORS.on_leave },
  ];
  const dataSS = [
    { month: "Jan", present: 95, late: 12, onLeave: 8 },
    { month: "Feb", present: 102, late: 15, onLeave: 6 },
    { month: "Mar", present: 98, late: 10, onLeave: 12 },
    { month: "Apr", present: 110, late: 8, onLeave: 5 },
    { month: "May", present: 105, late: 14, onLeave: 9 },
    { month: "Jun", present: 115, late: 7, onLeave: 4 },
  ];
  const totalEmployees = datas.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex items-center justify-center">
      <div className="w-11/12 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Today
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              {dayjs().format("DD MMMM YYYY")}
            </h2>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2 mb-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartNoAxesCombined className="h-4 w-4" />
                Attendance split
              </CardTitle>
              <CardDescription>
              Today's attendance statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="relative h-70 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        wrapperStyle={{ zIndex: 30 }}
                        content={<CustomPieTooltip total={totalEmployees} />}
                      />
                      <Pie
                        data={datas}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {datas.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            stroke="none"
                            className="cursor-pointer transition-opacity hover:opacity-80"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-foreground">
                      {totalEmployees}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Total Employees
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {datas.map((item) => {
                    const percent =
                      totalEmployees > 0
                        ? Math.round((item.value / totalEmployees) * 100)
                        : 0;

                    return (
                      <div
                        key={item.name}
                        className="group rounded-xl border border-border bg-muted/20 p-3 transition-all hover:bg-card hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background"
                              style={{ color: item.color }}
                            >
                              {item.name === "Present" && (
                                <UserCheck className="h-5 w-5" />
                              )}
                              {item.name === "Absent" && (
                                <UserMinus className="h-5 w-5" />
                              )}
                              {item.name === "On Leave" && (
                                <Plane className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">
                                {item.name}
                              </p>
                              <p className="text-md font-bold text-foreground">
                                {item.value}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-1">
                            <p className="text-xs font-bold text-muted-foreground">
                              {percent}%
                            </p>
                            <Progress value={percent} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                Attendance Rate
              </CardTitle>
              <CardDescription>
                Current attendance statistics in{" "}
                <span className="text-foreground">{"jan-2026"}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-75 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataSS}>
                    <CartesianGrid strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--muted)" />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--muted-foreground)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "var(--muted-foreground)",
                        fontSize: 10,
                      }}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={<CustomBarTooltip  />}
                      cursor={{ fill: "var(--muted)" }}

                      />
                    <Bar
                      dataKey="present"
                      name="Present"
                      radius={[4, 4, 0, 0]}
                      fill={ATTENDANCE_COLORS.present}
                    />

                    <Bar
                      dataKey="late"
                      name="Late"
                      radius={[4, 4, 0, 0]}
                      fill={ATTENDANCE_COLORS.late}
                    />

                    <Bar
                      dataKey="onLeave"
                      name="On Leave"
                      radius={[4, 4, 0, 0]}
                      fill={ATTENDANCE_COLORS.on_leave}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        <DataTable
          data={data}
          columns={generateAttendanceColumns("2026-06")}
          isLoading={false}
          totalCount={2}
        />
      </div>
    </div>
  );
}
