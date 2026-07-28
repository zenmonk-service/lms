import axiosInterceptorInstance from "@/config/axios";
import { GenerateEmployeeCodePayload } from "./generate-employee-code.types";

export const generateEmployeeCode = (payload: GenerateEmployeeCodePayload) => {
  const { org_uuid } = payload;
  return axiosInterceptorInstance.get("/users/employee-code", {
    headers: { org_uuid },
  });
};
