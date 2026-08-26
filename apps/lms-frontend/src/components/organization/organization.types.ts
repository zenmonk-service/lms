import {
  EmployeeIdMode,
  OrgAttendanceMethod,
  WorkDays,
} from "@/features/organizations/organizations.types";
import z from "zod";

export const orgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(100, "Organization name must be 100 characters or fewer"),
  domain: z
    .string()
    .trim()
    .nonempty("Domain is required")
    .max(100, "Domain must be 100 characters or fewer")
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format"),
});

export type OrgFormValues = z.infer<typeof orgSchema>;

const leaveExceptionSchema = z
  .object({
    tenure: z.string().optional(),
    balance: z.number().optional(),
    is_applicable: z.boolean(),
  })
  .nullable()
  .superRefine((data, ctx) => {
    if (!data?.is_applicable) return;
    if (!data.tenure) {
      ctx.addIssue({
        code: "custom",
        message: "Tenure is required",
        path: ["tenure"],
      });
    }

    const count = data.balance ?? 0;
    if (count <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Count must be greater than 0",
        path: ["balance"],
      });
    }
  });

const leaveAllocationSchema = z
  .object({
    cut_off: z.number().min(1).max(31).nullable(),
    is_applicable: z.boolean(),
  })
  .nullable()
  .superRefine((data, ctx) => {
    if (!data?.is_applicable) return;

    if (!data.cut_off) {
      ctx.addIssue({
        code: "custom",
        message: "Cutoff day is required",
        path: ["cut_off"],
      });
    }
  });

export const orgSettings = z
  .object({
    attendance_method: z.enum(Object.values(OrgAttendanceMethod)),
    work_days: z
      .array(z.enum(Object.values(WorkDays)))
      .min(1, "At least one work day must be selected"),
    start_time: z.string().nonempty("Start time is required"),
    end_time: z.string().nonempty("End time is required"),
    flexible_time: z.string().optional().nullable(),
    employee_id_pattern_value: z.array(z.string()).optional(),
    tenure: z.string().optional(),
    balance: z
      .number()
      .min(0, "Max Past Dated Leaves must be a positive number")
      .nullish(),
    employee_id_mode: z.enum(Object.values(EmployeeIdMode)),
    sandwich_leave_exception: leaveExceptionSchema,
    clubbing_leave_exception: leaveExceptionSchema,
    late_exception: z.object({
      is_applicable: z.boolean(),
      tenure: z.string().optional(),
      balance: z.number().optional(),
      time: z.string().optional().nullable(),
    }),
    leave_allocation_policy: leaveAllocationSchema,
  })
  .superRefine((data, ctx) => {
    if (
      data.employee_id_mode === EmployeeIdMode.AUTO &&
      (!data.employee_id_pattern_value ||
        data.employee_id_pattern_value.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Employee ID pattern value is required",
        path: ["employee_id_pattern_value"],
      });
    }

    if (data?.late_exception?.is_applicable) {
      if (!data.late_exception.tenure) {
        ctx.addIssue({
          code: "custom",
          message: "Tenure is required",
          path: ["late_exception", "tenure"],
        });
      }
      if (!data.late_exception.balance || data.late_exception.balance <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Count must be greater than 0",
          path: ["late_exception", "balance"],
        });
      }
      if (!data.late_exception.time) {
        ctx.addIssue({
          code: "custom",
          message: "Time is required",
          path: ["late_exception", "time"],
        });
      }
    }
  })
  .refine(
    (data) => {
      return data.start_time < data.end_time;
    },
    {
      message: "Start time must be before end time",
      path: ["start_time"],
    },
  )
  .refine(
    (data) => {
      if (data.tenure) {
        return data.balance !== null && data.balance !== undefined;
      }
      return true;
    },
    {
      message: "Max Past Dated Leaves is required when Tenure is selected",
      path: ["balance"],
    },
  );

export type OrgSettingsForm = z.infer<typeof orgSettings>;

export const appearance = z.object({
  theme: z.object({
    name: z.string(),
    value: z.string(),
    base: z.string(),
  }),
});

export type AppearanceType = z.infer<typeof appearance>;

export const tokenCategories: Record<string, string[]> = {
  date: ["{YYYY}", "{YY}", "{MM}", "{DD}"],
  breaker: ["{-}", "{_}", "{.}"],
  counter: ["Base Counter"],
  custom: ["Prefix / Text"],
};

export const FIXED_TOKEN_VALUES = new Set([
  ...tokenCategories.date,
  ...tokenCategories.breaker,
]);

export const PRESETS = [
  {
    id: "standard",
    label: "Standard",
    preview: "EMP-2026-07-0001",
    tokens: ["EMP-", "{YYYY}", "{-}", "{MM}", "{-}", "{DD}", "{-}", "{#100}"],
  },
  {
    id: "simple",
    label: "Simple counter",
    preview: "EMP-0001",
    tokens: ["EMP-", "{#100}"],
  },
  {
    id: "yearly",
    label: "Yearly reset",
    preview: "EMP-2026-0001",
    tokens: ["EMP-", "{YYYY}", "{-}", "{#100}"],
  },
] as const;

export type PresetId = (typeof PRESETS)[number]["id"] | "custom";
