import { bffClient } from "@/config/client";

export const getPublicHolidays = (year?: number) => {
  return bffClient.get(`/holidays`, {params: { year }});
};
