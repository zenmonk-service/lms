export const userSignInType = "user/signIn";

export interface CreateUserPayload {
  name: string;
  email?: string;
  password?: string;
  role_uuid: string;
  role:string
  org_uuid: string;

}


export interface UpdateUserPayload {
  user_uuid: string;
  name?: string;
  role?: string;
  org_uuid: string;
}



export interface listUserPayload {
  pagination: { page: number; limit?: number; search?: string };
  org_uuid: string;
  isCurrentUser?: boolean;
}
