import axiosInterceptorInstance from "@/config/axios";
import { CreateUserPayload } from "./create-user.types";

export const createUser = (payload: CreateUserPayload) => {
  const { org_uuid, ...body } = payload;
  return axiosInterceptorInstance.post("/users", body, { headers: { org_uuid } });
};
