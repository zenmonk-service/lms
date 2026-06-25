import axiosInterceptorInstance from "@/config/axios";
import { GetUserPayload } from "./get-user.types";

export const getUser = (payload: GetUserPayload) => {
  const { user_uuid, org_uuid } = payload;
  return axiosInterceptorInstance.get(`/users/${user_uuid}`, {
    headers: { org_uuid },
  });
};
