import { PublicRoleEnum } from "../user.type";

export interface CreateUserPayload {
  org_uuid: string;
  name: string;
  email: string;
  emp_code: string;
  password?: string;
  role_uuid: string;
  role: PublicRoleEnum;
  /** People the new user reports to (outside teams). */
  manager_uuids?: string[];
  /** Teams the new user joins. */
  team_uuids?: string[];
}
