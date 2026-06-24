import axiosInterceptorInstance from "@/config/axios";
import { CreateLeaveRequestPayload } from "./create-user-leave-request.types";

export const createUserLeaveRequests = (payload: CreateLeaveRequestPayload) => {
  const { org_uuid, user_uuid, ...data } = payload;
  return axiosInterceptorInstance.post(
    `/users/${user_uuid}/leave-requests`,
    data,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
