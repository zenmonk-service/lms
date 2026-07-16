import axiosInterceptorInstance from "@/config/axios";
import { ListUserPayload } from "./list-user.types";

export const listUser = (payload: ListUserPayload) => {
  const { org_uuid, pagination, month } = payload;
  return axiosInterceptorInstance.get(`/users`, {
    params:{ page: pagination.page, limit: pagination.limit, search: pagination.search, month: month },
    headers: { org_uuid },
  });
};
