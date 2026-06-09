import axiosInterceptorInstance from "@/config/axios";
import { CreateUserPayload } from "./create-user.types";

export const createUser = (user?: CreateUserPayload) => {
  return axiosInterceptorInstance.post("/users", user);
};
