import axiosInterceptorInstance from "@/config/axios";
import { ListLeaveTypesPayload } from "./list-leave-types.types";

export const listLeaveTypes = (payload: ListLeaveTypesPayload) => {
  const { org_uuid, params } = payload;
  return axiosInterceptorInstance.get(`/leave-types`, {
    headers: { org_uuid },
    params,
  });
};
