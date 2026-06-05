import axiosInterceptorInstance from "@/config/axios";

export const getUserNotifications = (org_uuid: string, user_uuid: string) => {
  return axiosInterceptorInstance.get(`/users/${user_uuid}/notifications`, {
    headers: {
      org_uuid,
    },
  });
};
