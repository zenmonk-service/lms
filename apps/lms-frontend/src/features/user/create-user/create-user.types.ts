import { PublicRoleEnum } from "../user.type";

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role_uuid: string;
  role: PublicRoleEnum;
  org_uuid: string;
  shift_uuid?: string;
  emp_code: string;
}
