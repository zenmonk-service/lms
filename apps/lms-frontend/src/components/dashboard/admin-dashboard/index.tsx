"use client";
import DataTable from "@/shared/table";
import {
  Clock3,
  CalendarDays,
  ChartNoAxesCombined,
  UserCheck,
  UserMinus,
  Plane,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { CustomBarTooltip, CustomPieTooltip } from "../shared/custom-tooltips";
import { generateAttendanceColumns } from "./columndef";

const ATTENDANCE_COLORS = {
  present: "var(--chart-1)",
  absent: "var(--chart-2)",
  on_leave: "var(--chart-3)",
  late: "var(--chart-4)",
};
export default function AdminDashboard() {
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

  const exportAttendanceExcel = (users: any[], month: string) => {
    const daysInMonth = dayjs(month).daysInMonth();

    const statusMap: Record<string, string> = {
      present: "P",
      absent: "A",
      on_leave: "L",
      late: "LT",
      holiday: "H",
      org_holiday: "OH",
      week_off: "WO",
    };

    const sheetData: any[][] = [];

    // Header Row
    sheetData.push([
      "Employee",
      "Type",
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      "Present",
      "Absent",
      "Leave",
      "Hours",
    ]);

    users.forEach((user) => {
      const statusRow: any[] = [user.name, "Status"];
      const checkInRow: any[] = ["", "Check In"];
      const checkOutRow: any[] = ["", "Check Out"];
      const hoursRow: any[] = ["", "Working Hours"];

      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let totalHours = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const attendance = user.attendances.find(
          (a: any) => dayjs(a.date).date() === day,
        );

        // Status
        statusRow.push(
          statusMap[attendance?.status] ?? attendance?.status ?? "-",
        );

        // Check In
        checkInRow.push(attendance?.check_in ?? "-");

        // Check Out
        checkOutRow.push(attendance?.check_out ?? "-");

        // Working Hours
        const hours =
          attendance?.working_hours ?? attendance?.affected_hours ?? "-";

        hoursRow.push(hours);

        // Summary
        if (attendance?.status === "present") presentCount++;
        if (attendance?.status === "absent") absentCount++;
        if (attendance?.status === "on_leave") leaveCount++;

        totalHours += Number(
          attendance?.working_hours ?? attendance?.affected_hours ?? 0,
        );
      }

      // Summary columns only on Status row
      statusRow.push(
        presentCount,
        absentCount,
        leaveCount,
        totalHours.toFixed(2),
      );

      // Empty summary columns for detail rows
      checkInRow.push("", "", "", "");
      checkOutRow.push("", "", "", "");
      hoursRow.push("", "", "", "");

      sheetData.push(statusRow);
      sheetData.push(checkInRow);
      sheetData.push(checkOutRow);
      sheetData.push(hoursRow);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Merge employee cells
    worksheet["!merges"] = [];

    const merges: XLSX.Range[] = [];

    let rowIndex = 1;

    users.forEach(() => {
      merges.push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex + 3, c: 0 },
      });

      rowIndex += 4;
    });

    worksheet["!merges"] = merges;
    // Column widths
    worksheet["!cols"] = [
      { wch: 25 }, // Employee
      { wch: 18 }, // Type
      ...Array.from({ length: daysInMonth }, () => ({
        wch: 12,
      })),
      { wch: 10 }, // Present
      { wch: 10 }, // Absent
      { wch: 10 }, // Leave
      { wch: 12 }, // Hours
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `attendance-${month}.xlsx`,
    );
  };
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
              <CardDescription>Today's attendance statistics</CardDescription>
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
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--muted)"
                    />

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
                      content={<CustomBarTooltip />}
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
          isExport={true}
          onExport={() => exportAttendanceExcel(data, "2026-06")}
        />
      </div>
    </div>
  );
}
