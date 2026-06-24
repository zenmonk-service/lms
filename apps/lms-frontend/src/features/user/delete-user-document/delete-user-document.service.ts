import axiosInterceptorInstance from "@/config/axios";

export const deleteUserDocument = (
  org_uuid: string,
  user_uuid: string,
  document_uuid: string,
) => {
  return axiosInterceptorInstance.delete(
    `/users/${user_uuid}/documents/${document_uuid}`,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
