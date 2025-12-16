import { PaginationState } from "../user/user.slice";

export interface listRolePayload{
    org_uuid: string;
    pagination?: PaginationState
}

export interface createRolePayload{
    org_uuid: string;
    name: string;
    description: string;
}