import axiosInterceptorInstance from "@/config/axios";
import { SignInInterface } from "./sign-in.types";

export const signIn = (signInfo?: SignInInterface) => {
  return axiosInterceptorInstance.post("/login", signInfo);
};
