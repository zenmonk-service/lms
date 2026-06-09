import axiosInterceptorInstance from "@/config/axios";

export const listUserDocuments = (org_uuid: string, user_uuid: string) => {
  return axiosInterceptorInstance.get(`/users/${user_uuid}/documents`, {
    headers: {
      org_uuid,
    },
  });
};
