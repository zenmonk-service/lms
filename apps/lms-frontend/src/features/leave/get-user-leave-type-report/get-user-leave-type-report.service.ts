import { bffClient } from "@/config/client";

export const getUserLeaveTypeReport = (payload: GetUserLeaveTypeReportPayload) => {
  const { org_uuid, pagination, month ,is_active} = payload;
  return bffClient.get(`/leave-types/report`, {
    params:{ page: pagination.page, limit: pagination.limit, search: pagination.search, month: month , is_active },
    headers: { org_uuid  },
  });
};
