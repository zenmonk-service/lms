import axiosInterceptorInstance from "@/config/axios";
import { CheckInPayload } from "./check-in.types";

export const checkInService = ({ org_uuid, user_uuid }: CheckInPayload) => {
  return axiosInterceptorInstance.patch(
    `/organizations/attendances/${user_uuid}/check-in`,
    {},
    {
      headers: {
        org_uuid,
      },
    },
  );
};
