export interface CreateUserPayload {
  name: string;
  email?: string;
  password?: string;
  role_uuid: string;
  role: string;
  org_uuid: string;
  shift_uuid?: string;
}
