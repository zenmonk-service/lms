import axiosInterceptorInstance from "@/config/axios";
import { ListUserPayload } from "./list-user.types";

export const listUser = (
payload: ListUserPayload
) => {
  return axiosInterceptorInstance.get(`/users`, {
    params:{page: payload.pagination.page, limit: payload.pagination.limit, search: payload.pagination.search, month: payload.month},
    headers: {
      org_uuid: payload.org_uuid,
    },
  });
};
