import { CreateUserDocumentPayload } from "./create-user-document.types";
import { bffClient } from "@/config/client";

export const createUserDocument = (
  org_uuid: string,
  user_uuid: string,
  payload: Omit<CreateUserDocumentPayload, "org_uuid" | "user_uuid">,
) => {
  return bffClient.post(
    `/users/${user_uuid}/documents`,
    payload,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
