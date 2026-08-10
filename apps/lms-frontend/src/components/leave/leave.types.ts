import { LeaveRange, LeaveRequestType } from "@/features/leave/leave.types";
import z from "zod";

export type LeaveAction = "approve" | "reject" | "recommend" | null;

export const fileSchema = z.object({
  file_url: z.string().url({ error: "Invalid file URL." }),
  file_name: z.string().trim().nonempty({ error: "File name is required." }),
  meta_data: z
    .object({
      type: z.string().trim().nonempty({ error: "File type is required." }),
      size: z.number().min(1, { error: "File size must be greater than 0." }),
    })
    .optional(),
})

export type IFile = z.infer<typeof fileSchema>;

export const leaveRequestSchema = z
  .object({
    leave_type_uuid: z
      .string()
      .trim()
      .nonempty({ error: "Please select a leave." }),
    type: z.enum(LeaveRequestType),
    range: z.enum(LeaveRange),
    managers: z
      .array(z.string())
      .min(1, "At least one manager needs to be selected."),
    reason: z
      .string()
      .trim()
      .max(255, "Reason must be at most 255 characters long")
      .optional(),
    date_range: z.object({
      start_date: z.string().nonempty({ error: "Date range is required." }),
      end_date: z.string().nonempty({ error: "Date range is required." }),
    }),
    documents: z.array(fileSchema).optional()
  })
  .refine(
    (data) => {
      if (!data.date_range.start_date || !data.date_range.end_date) {
        return true;
      }
      const startDate = new Date(data.date_range.start_date);
      const endDate = new Date(data.date_range.end_date);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return false;
      }
      return startDate <= endDate;
    },
    {
      message: "End date must be after or equal to start date.",
      path: ["date_range"],
    },
  )
  .refine(
    (data) => {
      if (!data.date_range.start_date || !data.date_range.end_date) {
        return true;
      }
      if (
        data.type === LeaveRequestType.SHORT_LEAVE ||
        data.type === LeaveRequestType.HALF_DAY
      ) {
        const startDate = new Date(data.date_range.start_date);
        const endDate = new Date(data.date_range.end_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return false;
        }
        return startDate.getTime() === endDate.getTime();
      }
      return true;
    },
    {
      message:
        "For Short Leave and Half Day, start and end date must be the same.",
      path: ["date_range"],
    },
  );

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

export const leaveTypeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Leave Type name is required")
      .max(100, "Leave Type name must be 256 characters or fewer"),
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .max(50, "Code must be 256 characters or fewer"),
    description: z
      .string()
      .trim()
      .max(255, "Description must be 256 characters or fewer")
      .optional(),
    applicable_for: z.object({
      users: z.array(z.string()),
      roles: z.array(z.string()),
    }),
    is_sandwich_enabled: z.boolean(),
    is_clubbing_enabled: z.boolean(),
    period: z.enum(["none", "monthly", "yearly" , "quarterly", "half_yearly"]),
    allow_negative_leaves: z.boolean(),
    showConsecutiveDays: z.boolean(),
    max_consecutive_days: z.string().trim().optional(),
    carry_forward: z.boolean(),
    leave_count: z
      .string()
      .trim()
      .nonempty("Leave count is required")
      .refine(
        (val) => {
          const num = Number(val);
          return !isNaN(num) && num > 0;
        },
        { message: "Leave count must be greater than 0" },
      )
      .refine(
        (val) => {
          const num = Number(val);
          return num <= 100;
        },
        { message: "Leave count must be no more than 100" },
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.applicable_for.roles.length === 0 &&
      data.applicable_for.users.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["applicable_for"],
        message: "Select at least one role or employee",
      });
    }

    if (!data.showConsecutiveDays) return;
    if (
      data?.max_consecutive_days &&
      !/^[1-9]\d*$/.test(data?.max_consecutive_days)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_consecutive_days"],
        message: "Only positive numbers are allowed",
      });
    }

    if (Number(data.max_consecutive_days) > 60) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_consecutive_days"],
        message: "Max consecutive days must be no more than 60",
      });
    }
  });

export type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;

export const slaSchema = z.object({
  leave_type_uuid: z.string().min(1, "Leave type is required"),
  sla: z.number().min(1, "SLA must be greater than 0"),
});

export type SlaFormValues = z.infer<typeof slaSchema>;
