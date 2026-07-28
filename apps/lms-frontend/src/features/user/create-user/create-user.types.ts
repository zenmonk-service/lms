import { PublicRoleEnum } from "../user.type";

export interface CreateUserPayload {
  org_uuid: string;
  name: string;
  email: string;
  emp_code: string;
  password?: string;
  role_uuid: string;
  role: PublicRoleEnum;
}
