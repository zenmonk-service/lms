import axiosInterceptorInstance from "@/config/axios";
import { CreateLeaveTypePayload } from "./create-leave-type.types";

export const createLeaveType = (payload: CreateLeaveTypePayload) => {
  const { org_uuid, ...data } = payload;

  return axiosInterceptorInstance.post(`/organizations/leave-types`, data, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};
