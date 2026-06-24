import type { PaginationState } from "../../user/user.type";

export interface listPermissionPayload {
  org_uuid: string;
  pagination?: PaginationState;
}
