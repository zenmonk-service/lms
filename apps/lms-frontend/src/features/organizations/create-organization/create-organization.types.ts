export interface CreateOrganizationPayload {
    name: string;
    domain: string;
    logo_url?: string;
    description?: string;
}