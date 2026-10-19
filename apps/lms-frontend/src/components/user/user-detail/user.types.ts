import { UserDocumentType as CommonUserDocumentType } from "@repo/common";
import { IFile } from "@/features/leave/leave.types";
import {
  EmploymentType,
  Gender,
  GuardianRelation,
  MaritalStatus,
  WorkMode,
} from "@/features/user/user.type";
import { z } from "zod";

export const DocumentTypes = CommonUserDocumentType.ENUM;
export type DocumentTypes =
  (typeof CommonUserDocumentType.ENUM)[keyof typeof CommonUserDocumentType.ENUM];

const PHONE_DIGITS_ONLY_MESSAGE = "Phone number should only contain digits.";
const PHONE_LENGTH_MESSAGE = "Enter a valid 10-digit phone number.";

// Two checks, but run as one superRefine (not two chained validators) so
// the order is ours to decide rather than left to zod's own issue
// ordering — a value like "44444444hhhhhhhh" previously surfaced a
// misleading length error instead of the digits-only one. Digits-only is
// checked first and short-circuits: a value with letters shouldn't also
// complain about length until the letters are gone.
const phoneSchema = () =>
  z
    .string()
    .trim()
    .optional()
    .superRefine((value, ctx) => {
      if (!value) return;

      if (!/^\d*$/.test(value)) {
        ctx.addIssue({ code: "custom", message: PHONE_DIGITS_ONLY_MESSAGE });
        return;
      }

      if (value.length !== 10) {
        ctx.addIssue({ code: "custom", message: PHONE_LENGTH_MESSAGE });
      }
    });

export const fileSchema = z.object({
  file_url: z.string().url({ error: "Invalid file URL." }),
  file_name: z.string().trim().nonempty({ error: "File name is required." }),
  meta_data: z
    .object({
      type: z.string().trim().nonempty({ error: "File type is required." }),
      size: z.number().min(1, { error: "File size must be greater than 0." }),
    })
    .optional(),
});

export type FileFormData = z.infer<typeof fileSchema>;

export const documentSchema = z.object({
  document_type: z.enum(DocumentTypes, {
    message: "Document type is required.",
  }),
  document_number: z
    .string()
    .trim()
    .max(40, "Document number must be 40 characters or fewer.")
    .optional(),
  attachments: z
    .array(fileSchema)
    .min(1, { error: "At least one attachment is required." }),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

export const editUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(50, "Name must be 50 characters or fewer"),
    email: z
      .string()
      .trim()
      .nonempty("Email is required")
      .email("Enter a valid email address")
      .max(50, "Email must be 50 characters or fewer"),
    role_uuid: z.string().trim().min(1, "Role is required"),
    shift_uuid: z.string().trim().min(1, "Shift is required"),
    work_mode: z.enum(WorkMode).optional(),
    work_branch: z
      .string()
      .trim()
      .max(255, "Branch must be 255 characters or fewer")
      .optional(),
    employment_type: z.enum(EmploymentType).optional(),
    pf_information: z
      .object({
        is_enrolled: z.boolean().optional(),
        pf_number: z
          .string()
          .trim()
          .max(50, "PF number must be 50 characters or fewer.")
          .optional(),
        uan_number: z
          .string()
          .trim()
          .max(50, "UAN number must be 50 characters or fewer.")
          .optional(),
      })
      .optional(),
    personal_information: z.object({
      dob: z.string().trim().optional().nullable(),
      gender: z.enum(Gender).optional(),
      phone_number: phoneSchema(),
      current_address: z.string().trim().optional(),
      permanent_address: z.string().trim().optional(),
      marital_status: z.enum(MaritalStatus).optional(),
      parent_information: z
        .object({
          father_name: z
            .string()
            .trim()
            .max(50, "Father's name must be 50 characters or fewer.")
            .regex(
              /^[A-Za-z\s]+$/,
              "Father's name must contain only letters and spaces.",
            )
            .optional()
            .or(z.literal("")),
          mother_name: z
            .string()
            .trim()
            .max(50, "Mother's name must be 50 characters or fewer.")
            .regex(
              /^[A-Za-z\s]+$/,
              "Mother's name must contain only letters and spaces.",
            )
            .optional()
            .or(z.literal("")),
          father_phone: phoneSchema(),
          mother_phone: phoneSchema(),
        })
        .optional(),

      guardian_information: z
        .object({
          guardian_name: z
            .string()
            .trim()
            .max(50, "Guardian's name must be 50 characters or fewer.")
            .regex(
              /^[A-Za-z\s]+$/,
              "Guardian's name must contain only letters and spaces.",
            )
            .optional()
            .or(z.literal("")),
          guardian_relation: z.enum(Object.values(GuardianRelation)).or(z.literal("")).optional(),
          guardian_phone: phoneSchema(),
        })
        .optional(),
    }),
    documents: z.array(documentSchema).optional(),
    clubbing_leave_exception_balance: z.number().nullable().optional(),
    sandwich_leave_exception_balance: z.number().nullable().optional(),
    past_dated_leave_balance: z.number().nullable().optional(),
    late_exception_balance: z.number().nullable().optional(),
  });

export type EditUserFormData = z.infer<typeof editUserSchema>;

export interface UserDocument {
  id: string;
  uuid: string;
  document_type: DocumentTypes;
  document_number?: string;
  attachments: IFile[];
  created_at: string;
  updated_at: string;
}

export interface DocumentDraft {
  id: string;
  name: string;
  number: string;
  files: File[];
}

export const createDocumentDraft = (): DocumentDraft => ({
  id: crypto.randomUUID(),
  name: "",
  number: "",
  files: [],
});
