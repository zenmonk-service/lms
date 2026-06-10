import axiosInterceptorInstance from "@/config/axios";
import { ActiveUserActionType } from "./activate-user.type";

export const activateUser = (payload: ActiveUserActionType) => {
  return axiosInterceptorInstance.patch(`/users/${payload?.user_uuid}/activate`,
     null, {
    headers: {
      org_uuid: payload?.org_uuid,
    },
  });
};