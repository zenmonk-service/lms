import axiosInterceptorInstance from "@/config/axios";

export const isUserExist = (email: string) => {
  return axiosInterceptorInstance.get(`/users/exists`, {
    params: { email },
  });
};
