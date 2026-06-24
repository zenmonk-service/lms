export interface ListUserOrganizationsPayload {
  uuid: string;
  params?: {
    page: number;
    limit: number;
    search?: string;
  };
}
