import axiosInterceptorInstance from "@/config/axios";
import { ListLeaveTypesPayload } from "./list-leave-types.types";

export const listLeaveTypes = (payload: ListLeaveTypesPayload) => {
  const { org_uuid } = payload;
  return axiosInterceptorInstance.get(`/organizations/leave-types`, {
    headers: {
      org_uuid,
    },
  });
};
