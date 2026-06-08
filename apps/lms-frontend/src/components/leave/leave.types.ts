import { LeaveRequestType } from "@/features/leave/leave.types";
import z from "zod";

export const leaveRequestSchema = z
  .object({
    leave_type_uuid: z
      .string()
      .trim()
      .nonempty({ error: "Please select a leave." }),
    type: z.string().nonempty({ error: "Please select a leave type." }),
    range: z.string().nonempty({ error: "Please select a leave range." }),
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
