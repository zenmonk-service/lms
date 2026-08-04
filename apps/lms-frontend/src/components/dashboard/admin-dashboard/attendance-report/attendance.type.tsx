import z from "zod";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
const attendanceStatusSchema = z.enum(
  Object.values(AttendanceStatus) as [AttendanceStatus, ...AttendanceStatus[]],
);

export const updateTimeSchema = z
  .object({
    check_in: z.string().nullable(),
    check_out: z.string().nullable(),
    status: attendanceStatusSchema,
    remarks: z
      .string()
      .trim()
      .max(255, "Remarks must be less than 255 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const isNullableStatus =
      data.status === AttendanceStatus.ABSENT ||
      data.status === AttendanceStatus.ON_LEAVE;

    if (isNullableStatus) {
      return;
    }

    if (!data.check_in) {
      ctx.addIssue({
        code: "custom",
        message: "Check in and check out are required",
        path: ["check_in"],
      });
    }

    if (!data.check_out) {
      ctx.addIssue({
        code: "custom",
        message: "Check in and check out are required",
        path: ["check_out"],
      });
    }

    const parseTime = (time: string) => {
      const [clock, period] = time.trim().split(" ");
      const [rawHours, rawMinutes] = clock.split(":").map(Number);
      let hours = rawHours;
      const minutes = rawMinutes;

      if (period === "PM" && hours !== 12) {
        hours += 12;
      }

      if (period === "AM" && hours === 12) {
        hours = 0;
      }

      return hours * 60 + minutes;
    };

    if (data.check_out && data.check_in && parseTime(data.check_out) <= parseTime(data.check_in)) {
      ctx.addIssue({
        code: "custom",
        message: "Check out must be later than check in",
        path: ["check_out"],
      });
    }
  });

export type UpdateTimeForm = z.infer<typeof updateTimeSchema>;
