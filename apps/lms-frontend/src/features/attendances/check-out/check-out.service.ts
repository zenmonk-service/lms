import axiosInterceptorInstance from "@/config/axios";
import { CheckOutPayload } from "./check-out.types";

export const checkOutService = ({ org_uuid, user_uuid }: CheckOutPayload) => {
  return axiosInterceptorInstance.patch(
    `/organizations/attendances/${user_uuid}/check-out`,
    {},
    {
      headers: {
        org_uuid,
      },
    },
  );
};
