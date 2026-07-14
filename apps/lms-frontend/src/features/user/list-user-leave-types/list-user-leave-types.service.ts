import axiosInterceptorInstance from "@/config/axios";
import { ListUserLeaveTypesPayload } from "./list-user-leave-types.types";

export const listLeaveTypesService = (payload: ListUserLeaveTypesPayload) => {
  const { org_uuid, user_uuid } = payload;
  return axiosInterceptorInstance.get(`/leave-types`, {
    headers: { org_uuid },
    params: { user_uuid },
  });
};
