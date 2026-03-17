
export interface listRolePayload{
    org_uuid: string;
}

export interface createRolePayload{
    org_uuid: string;
    name: string;
    description: string;
}