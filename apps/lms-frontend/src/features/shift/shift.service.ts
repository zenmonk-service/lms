import { ListShift } from "./shift.type";
import { bffClient } from "@/config/client";

export const listOrganizationShiftsService = (payload: ListShift) => {
  return bffClient.get(`/organizations/shifts`, {
    headers: {
      org_uuid: payload?.org_uuid,
    },
  });
};