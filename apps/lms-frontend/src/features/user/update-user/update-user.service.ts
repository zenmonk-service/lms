import axiosInterceptorInstance from "@/config/axios";
import { UpdateUserPayload } from "./update-user.types";

export const updateUser = (user?: UpdateUserPayload) => {
  return axiosInterceptorInstance.put("/users", user);
};
