export const ATTENDANCE_COLORS = {
  present: "var(--chart-1)",
  absent: "var(--chart-2)",
  on_leave: "var(--chart-3)",
} as const;

export const LEAVE_STATUS_COLORS = {
  pending: "var(--chart-1)",
  approved: "var(--chart-2)",
  recommended: "var(--chart-3)",
  rejected: "var(--chart-4)",
  cancelled: "var(--chart-5)",
} as const;