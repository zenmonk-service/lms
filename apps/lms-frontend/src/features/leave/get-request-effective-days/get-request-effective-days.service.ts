import axiosInterceptorInstance from "@/config/axios";
import { GetRequestEffectiveDaysPayload } from "./get-request-effective-days.types";

export const getRequestEffectiveDays = (
  payload: GetRequestEffectiveDaysPayload,
) => {
  const { org_uuid, ...params } = payload;
  return axiosInterceptorInstance.get(`/leave-requests/effective-days`, {
    params,
    headers: {
      org_uuid,
    },
  });
};
