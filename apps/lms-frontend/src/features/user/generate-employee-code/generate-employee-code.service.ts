import { GenerateEmployeeCodePayload } from "./generate-employee-code.types";
import { bffClient } from "@/config/client";

export const generateEmployeeCode = (payload: GenerateEmployeeCodePayload) => {
  const { org_uuid, role_uuid } = payload;
  return bffClient.get("/users/employee-code", {
    headers: { org_uuid },
    params: { role_uuid },
  });
};
