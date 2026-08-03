import { CreateUserPayload } from "./create-user.types";
import { bffClient } from "@/config/client";

export const createUser = (payload: CreateUserPayload) => {
  const { org_uuid, ...body } = payload;
  return bffClient.post("/users", body, { headers: { org_uuid } });
};
