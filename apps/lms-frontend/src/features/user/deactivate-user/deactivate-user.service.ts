import axiosInterceptorInstance from "@/config/axios";
import { DeactivateUserActionType } from "./deactivate-user.type";

export const deactivateUser = (payload: DeactivateUserActionType) => {
  return axiosInterceptorInstance.patch(
    `/users/${payload?.user_uuid}/deactivate`,
    null,
    {
      headers: {
        org_uuid: payload?.org_uuid,
      },
    }
  );
};