import { bffClient } from "@/config/client";
import { DeleteUserDocumentPayload } from "../user.type";

export const deleteUserDocument = (data: DeleteUserDocumentPayload) => {
  return bffClient.delete(
    `/users/${data.user_uuid}/documents/${data.document_uuid}`,
    {
      headers: {
        org_uuid: data.org_uuid,
      },
    },
  );
};
