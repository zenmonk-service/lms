import axiosInterceptorInstance from "@/config/axios";
import { UpdateUserPayload } from "./update-user.types";

export const updateUser = (
  payload: Partial<UpdateUserPayload> & { org_uuid: string; user_uuid: string },
) => {
  const { org_uuid, user_uuid, ...rest } = payload;
  return axiosInterceptorInstance.put(`/users/${user_uuid}`, rest, {
    headers: { org_uuid },
  });
};
