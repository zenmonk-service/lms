import { z } from "zod";

export const editUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or fewer"),
  email: z
    .string()
    .trim()
    .nonempty("Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address")
    .max(50, "Email must be 50 characters or fewer"),
  role: z.string().trim().min(1, "Role is required"),
  shift: z.string().trim().min(1, "Shift is required"),
  designation: z
    .string()
    .trim()
    .max(100, "Designation must be 100 characters or fewer")
    .optional(),
  marital_status: z.enum(["single", "married", "divorced", "widowed"]).optional(),
  employment_type: z.enum(["full_time", "intern", "contract"]).optional(),
  work_mode: z.enum(["office", "remote", "hybrid"]).optional(),
  work_branch: z
    .string()
    .trim()
    .max(100, "Branch must be 100 characters or fewer")
    .optional(),
  official_phone: z
    .string()
    .trim()
    .max(20, "Phone must be 20 characters or fewer")
    .refine((value) => !value || /^[0-9+\-\s()]*$/.test(value), {
      message: "Enter a valid phone number",
    })
    .optional(),
  emergency_contact_name: z
    .string()
    .trim()
    .max(100, "Emergency contact name must be 100 characters or fewer")
    .optional(),
  emergency_contact_relation: z
    .string()
    .trim()
    .max(50, "Relation must be 50 characters or fewer")
    .optional(),
  emergency_contact_phone: z
    .string()
    .trim()
    .max(20, "Phone must be 20 characters or fewer")
    .refine((value) => !value || /^[0-9+\-\s()]*$/.test(value), {
      message: "Enter a valid phone number",
    })
    .optional(),
  guardian_contact_name: z
    .string()
    .trim()
    .max(100, "Guardian contact name must be 100 characters or fewer")
    .optional(),
  guardian_contact_relation: z
    .string()
    .trim()
    .max(50, "Relation must be 50 characters or fewer")
    .optional(),
  guardian_contact_phone: z
    .string()
    .trim()
    .max(20, "Phone must be 20 characters or fewer")
    .refine((value) => !value || /^[0-9+\-\s()]*$/.test(value), {
      message: "Enter a valid phone number",
    })
    .optional(),
});

export type EditUserFormData = z.infer<typeof editUserSchema>;

export interface UserDetailPageProps {
  organizationUuid: string;
  userUuid: string;
}

export interface UserDocument {
  uuid: string;
  document_name: string;
  document_type?: string | null;
  document_number?: string | null;
  file_url: string;
  file_urls?: string[] | null;
  metadata?: Record<string, string | string[]> | null;
  created_at?: string;
}

export interface DocumentDraft {
  id: string;
  name: string;
  number: string;
  files: File[];
}

export const DOCUMENT_NAME_MAX_LENGTH = 100;
export const DOCUMENT_NUMBER_MAX_LENGTH = 100;

export const createDocumentDraft = (): DocumentDraft => ({
  id: crypto.randomUUID(),
  name: "",
  number: "",
  files: [],
});
