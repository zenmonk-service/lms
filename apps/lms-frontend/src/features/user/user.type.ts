export const userSignInType = "user/signIn";

export interface CreateUserPayload {
  name: string;
  email?: string;
  password?: string;
  role_uuid: string;
  role: string;
  org_uuid: string;
  shift_uuid?: string;
}

export interface UpdateUserPayload {
  user_uuid: string;
  name?: string;
  role?: string;
  org_uuid: string;
  shift_uuid?: string;
  image?: string | null;
  designation?: string | null;
  marital_status?: "single" | "married" | "divorced" | "widowed" | null;
  employment_type?: "full_time" | "intern" | "contract" | null;
  work_mode?: "office" | "remote" | "hybrid" | null;
  work_branch?: string | null;
  official_phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relation?: string | null;
  emergency_contact_phone?: string | null;
  guardian_contact_name?: string | null;
  guardian_contact_relation?: string | null;
  guardian_contact_phone?: string | null;
}

export interface listUserPayload {
  pagination: { page: number; limit?: number; search?: string };
  org_uuid: string;
  isCurrentUser?: boolean;
  isInfiniteScroll?: boolean;
}
