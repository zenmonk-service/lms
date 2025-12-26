import axiosInterceptorInstance from "@/config/axios";
import { SignInInterface } from "./user.slice";
import { CreateUserPayload, UpdateUserPayload } from "./user.type";
import axios from "axios";

export const getUserOrganizations = (userId: string) => {
  return axiosInterceptorInstance.get(`/users/${userId}/organizations`);
};

export const signIn = (signInfo?: SignInInterface) => {
  return axiosInterceptorInstance.post("/login", signInfo);
};

export const createUser = (user?: CreateUserPayload) => {
  return axiosInterceptorInstance.post("/users", user);
};

export const updateUser = (user?: UpdateUserPayload) => {
  return axiosInterceptorInstance.put("/users", user);
};

export const listUser = (
  filters: { page: number; limit?: number, search?: string },
  org_uuid: string
) => {
  return axiosInterceptorInstance.get(`/users`, {
    params: filters,
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const isUserExist = (email: string) => {
  return axiosInterceptorInstance.get(`/users/exists`, {
    params: { email },
  });
}


export const imageUpload = (payload: FormData) => {
  return axios.post(`${process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_URL}`, payload);
}