import axiosInterceptorInstance from "@/config/axios";
import { CreateUserDocumentPayload } from "./create-user-document.types";

export const createUserDocument = (
  org_uuid: string,
  user_uuid: string,
  payload: Omit<CreateUserDocumentPayload, "org_uuid" | "user_uuid">,
) => {
  return axiosInterceptorInstance.post(
    `/users/${user_uuid}/documents`,
    payload,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
