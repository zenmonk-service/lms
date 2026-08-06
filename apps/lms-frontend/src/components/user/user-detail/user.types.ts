import { IFile } from "@/features/leave/leave.types";
import {
  EmploymentType,
  Gender,
  GuardianRelation,
  MaritalStatus,
  WorkMode,
} from "@/features/user/user.type";
import { z } from "zod";

export enum DocumentTypes {
  AADHAAR_CARD = "aadhaar_card",
  PAN_CARD = "pan_card",
  PASSPORT = "passport",
  DRIVING_LICENSE = "driving_license",
  RESUME = "resume",
  EDUCATION_CERTIFICATE = "education_certificate",
  EXPERIENCE_CERTIFICATE = "experience_certificate",
  OFFER_LETTER = "offer_letter",
  OTHER = "other",
}

const isValidPhone = (phone: string) => /^\d{10,}$/.test(phone);

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

export type FileFormData = z.infer<typeof fileSchema>;

export const documentSchema = z.object({
  document_type: z.enum(DocumentTypes),
  document_number: z.string().trim().max(40).optional(),
  attachments: z.array(fileSchema).min(1, { error: "At least one attachment is required." }),
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
      .max(100, "Branch must be 100 characters or fewer")
      .optional(),
    employment_type: z.enum(EmploymentType).optional(),
    personal_information: z.object({
      dob: z.string().trim().optional().nullable(),
      gender: z.enum(Gender).optional(),
      phone_number: z.string().trim().optional(),
      current_address: z.string().trim().optional(),
      permanent_address: z.string().trim().optional(),
      marital_status: z.enum(MaritalStatus).optional(),
      parent_information: z
        .object({
          father_name: z.string().trim().max(50).optional(),
          mother_name: z.string().trim().max(50).optional(),
          father_phone: z.string().trim().optional(),
          mother_phone: z.string().trim().optional(),
        })
        .optional(),
      guardian_information: z
        .object({
          guardian_name: z.string().trim().max(50).optional(),
          guardian_relation: z.enum(GuardianRelation).optional(),
          guardian_phone: z.string().trim().optional(),
        })
        .optional(),
    }),
    documents: z.array(documentSchema).optional()
  })
  .refine(
    (data) => {
      const phone = data.personal_information?.phone_number;
      return !phone || isValidPhone(phone);
    },
    {
      message:
        "Phone number must contain only digits and be at least 10 digits long.",
      path: ["personal_information", "phone_number"],
    },
  )
  .refine(
    (data) => {
      const phone = data.personal_information?.parent_information?.father_phone;
      return !phone || isValidPhone(phone);
    },
    {
      message:
        "Phone number must contain only digits and be at least 10 digits long.",
      path: ["personal_information", "parent_information", "father_phone"],
    },
  )
  .refine(
    (data) => {
      const phone = data.personal_information?.parent_information?.mother_phone;
      return !phone || isValidPhone(phone);
    },
    {
      message:
        "Phone number must contain only digits and be at least 10 digits long.",
      path: ["personal_information", "parent_information", "mother_phone"],
    },
  )
  .refine(
    (data) => {
      const phone =
        data.personal_information?.guardian_information?.guardian_phone;
      return !phone || isValidPhone(phone);
    },
    {
      message:
        "Phone number must contain only digits and be at least 10 digits long.",
      path: ["personal_information", "guardian_information", "guardian_phone"],
    },
  );

export type EditUserFormData = z.infer<typeof editUserSchema>;

export interface UserDocument {
  id: string;
  uuid: string;
  document_type: DocumentTypes;
  document_number?:string;
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
