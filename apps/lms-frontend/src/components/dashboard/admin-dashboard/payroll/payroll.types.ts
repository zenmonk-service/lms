import { AttendanceStatus } from "@/features/attendances/attendances.type";
import z from "zod";

export const ReconciliationRowSchema = z.object({
  date: z.string(),
  status: z.enum(AttendanceStatus),
});

export const ReconciliationSchema = z.object({
  records: z
    .array(ReconciliationRowSchema)
    .refine(
      (records) => records.every((record) => record.status !== undefined),
      { message: "Please select a status for every date before saving." },
    ),
});

export type ReconciliationRowValues = z.infer<typeof ReconciliationRowSchema>;
export type ReconciliationFormValues = z.infer<typeof ReconciliationSchema>;
