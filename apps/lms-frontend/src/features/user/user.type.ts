import type { UserDocument } from "@/components/user/user-detail/user.types";
import { LeaveBalance } from "../leave/leave.types";
import { OrganizationSettings } from "../organizations/organizations.types";

export const userSignInType = "user/signIn";

export enum EmploymentType {
  INTERN = "intern",
  CONTRACT = "contract",
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  TEMPORARY = "temporary",
}

export enum WorkMode {
  OFFICE = "office",
  REMOTE = "remote",
  HYBRID = "hybrid",
}

export enum MaritalStatus {
  SINGLE = "single",
  MARRIED = "married",
  DIVORCED = "divorced",
  WIDOWED = "widowed",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

export enum GuardianRelation {
  GRANDMOTHER = "grandmother",
  GRANDFATHER = "grandfather",
  BROTHER = "brother",
  SISTER = "sister",
  UNCLE = "uncle",
  AUNT = "aunt",
  GUARDIAN = "guardian",
  OTHER = "other",
}

export enum PublicRoleEnum {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  USER = "user",
}

export interface ParentInformation {
  father_name: string;
  mother_name: string;
  father_phone: string;
  mother_phone: string;
}

export interface GuardianInformation {
  guardian_name: string;
  guardian_relation: GuardianRelation;
  guardian_phone: string;
}

export interface PersonalInformationInterface {
  user_id: string;
  dob: string | null;
  gender: Gender | null;
  phone_number: string | null;
  current_address: string | null;
  permanent_address: string | null;
  marital_status: MaritalStatus | null;
  parent_information: Partial<ParentInformation> | null;
  guardian_information: Partial<GuardianInformation> | null;
}

export interface UserRole {
  id: number;
  uuid: string;
  name: string;
  description: string;
  organization_setting?: OrganizationSettings | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserInterface {
  name: string;
  email: string;
  emp_code?: string;
  user_id: string;
  role: Partial<UserRole>;
  organization_shift?: {
    id?: number;
    uuid: string;
    name: string;
    start_time: string;
    end_time: string;
    effective_hours: number | string;
    flexible_time?: string;
  };
  image: string | null;
  shift_id: number | null;
  is_active: boolean;
  documents?: UserDocument[];
  parent_id?: number | null;
  work_mode?: WorkMode | null;
  work_branch?: string | null;
  leave_balances?: LeaveBalance[];
  employment_type?: EmploymentType | null;
  personal_information?: PersonalInformationInterface | null;
  created_at: string | Date;
  clubbing_leave_exception_balance?: number;
  sandwich_leave_exception_balance?: number;
  past_dated_leave_balance?: number;
}

export interface PaginationState {
  page: number;
  limit: number;
  search: string;
}

export type UserState = {
  isLoading: boolean;
  isLoadingMore: boolean,
  users: UserInterface[];
  pagination: PaginationState;
  count: number;
  total: number;
  currentPage: number;
  error?: string | null;
  isUserExist: boolean;
  currentUser: UserInterface;
  isExistLoading: boolean;
  selectedUser: UserInterface | null;
  isGeneratingCode: boolean;
};

export type { SignInInterface } from "./sign-in/sign-in.types";
export type { CreateUserPayload } from "./create-user/create-user.types";
export type { UpdateUserPayload } from "./update-user/update-user.types";
export type { ListUserPayload } from "./list-user/list-user.types";
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
  LIST_USER_LEAVE_TYPES = "user/listLeaveTypes",
  GENERATE_EMPLOYEE_CODE = "user/generateEmployeeCode",
  FORGOT_PASSWORD = "user/forgotPassword",
  RESET_PASSWORD = "user/resetPassword",
  IS_RESET_LINK_VALID = "user/isResetLinkValid",
}
