import type { PaginationState } from "../user/user.type";

export interface Role {
  uuid: string;
  name: string;
  description: string;
  code: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RoleState {
  isLoading: boolean;
  error: string | null;
  roles: Role[];
  total: number;
  currentPage: number;
  pagination: PaginationState;
}

export type { listRolePayload } from "./list-organization-roles/list-organization-roles.types";
export type { createRolePayload } from "./create-organization-role/create-organization-role.types";
