import { CheckOutPayload } from "./check-out.types";
import { bffClient } from "@/config/client";

export const checkOutService = ({ org_uuid, user_uuid }: CheckOutPayload) => {
  return bffClient.patch(
    `/users/${user_uuid}/check-out`,
    {},
    {
      headers: {
        org_uuid,
      },
    },
  );
};
