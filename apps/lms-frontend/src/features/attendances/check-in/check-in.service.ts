import { CheckInPayload } from "./check-in.types";
import { bffClient } from "@/config/client";

export const checkInService = ({ org_uuid, user_uuid }: CheckInPayload) => {
  return bffClient.patch(
    `/users/${user_uuid}/check-in`,
    {},
    {
      headers: {
        org_uuid,
      },
    },
  );
};
