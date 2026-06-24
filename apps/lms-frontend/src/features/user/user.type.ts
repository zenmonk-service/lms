import type { UserDocument } from "@/components/user/user-detail/user.types";

export const userSignInType = "user/signIn";

export interface PersonalInformationInterface {
  id?: number;
  user_id?: string | number;
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
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UserInterface {
  id?: number;
  user_id: string;
  name: string;
  email: string;
  role: {
    id: string;
    uuid: string;
    name: string;
    description: string;
    role_level?: number;
  };
  organization_shift: {
    id?: number;
    uuid: string;
    name: string;
    start_time: string;
    end_time: string;
    effective_hours: number | string;
    flexible_time?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  image?: string;
  parent_id?: number | null;
  role_id?: number;
  shift_id?: number;
  personal_information?: PersonalInformationInterface;
  documents: UserDocument[];
}

export interface PaginationState {
  page: number;
  limit: number;
  search: string;
}

export type UserState = {
  isLoading: boolean;
  organizations: any[];
  users: UserInterface[];
  pagination: PaginationState;
  total: number;
  currentPage: number;
  error?: string | null;
  isUserExist: boolean;
  currentUser: UserInterface;
  isExistLoading: boolean;
  selectedUser: UserInterface | null;
};

export type { SignInInterface } from "./sign-in/sign-in.types";
export type { CreateUserPayload } from "./create-user/create-user.types";
export type { UpdateUserPayload } from "./update-user/update-user.types";
export type { listUserPayload } from "./list-user/list-user.types";
export type { ListUserDocumentsPayload } from "./list-user-documents/list-user-documents.types";
export type { CreateUserDocumentPayload } from "./create-user-document/create-user-document.types";
export type { DeleteUserDocumentPayload } from "./delete-user-document/delete-user-document.types";
export type { GetOrganizationUserPayload } from "./get-organization-user/get-organization-user.types";

export enum UserActionType {
  SIGN_IN = "user/signIn",
  SIGN_OUT = "user/signOut",
  CREATE_USER = "user/create",
  UPDATE_USER = "user/update",
  DELETE_USER = "user/delete",
  LIST_USERS = "user/list",
  GET_USER = "user/get",
  LIST_USER_DOCUMENTS = "user/listDocuments",
  CREATE_USER_DOCUMENT = "user/createDocument",
  DELETE_USER_DOCUMENT = "user/deleteDocument",
  GET_ORGANIZATION_USERS = "organization/getUsers",
  IS_USER_EXIST = "user/isExist",
  ACTIVATE_USER = "user/activate",
  DEACTIVATE_USER = "user/deactivate",
}