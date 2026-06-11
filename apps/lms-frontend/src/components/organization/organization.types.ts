import { OrgAttendanceMethod, UserIdPattern, WorkDays } from "@/features/organizations/organizations.types";
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
  description: z.string().trim().optional(),
});

export type OrgFormValues = z.infer<typeof orgSchema>;

export const orgSettings = z
  .object({
    attendance_method: z.enum(Object.values(OrgAttendanceMethod)),
    work_days: z
      .array(z.enum(Object.values(WorkDays)))
      .min(1, "At least one work day must be selected"),
    start_time: z.string().nonempty("Start time is required"),
    end_time: z.string().nonempty("End time is required"),
    employee_id_pattern_type: z.enum(Object.values(UserIdPattern)),
    employee_id_pattern_value: z
      .string()
      .nonempty("Employee ID pattern value is required"),
  })
  .refine(
    (data) => {
      return data.start_time < data.end_time;
    },
    {
      message: "Start time must be before end time",
      path: ["start_time"],
    },
  );

export type OrgSettingsForm = z.infer<typeof orgSettings>;
