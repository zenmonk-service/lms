import { ListUserPayload } from "./list-user.types";
import { bffClient } from "@/config/client";

export const listUser = (payload: ListUserPayload) => {
  const { org_uuid, pagination, month } = payload;
  return bffClient.get(`/users`, {
    params:{ page: pagination.page, limit: pagination.limit, search: pagination.search, month: month },
    headers: { org_uuid },
  });
};
