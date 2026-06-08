import axiosInterceptorInstance from "@/config/axios";

export const getUserLeaveRequest = (
  org_uuid: string,
  user_uuid: string,
  leave_request_uuid: string,
) => {
  return axiosInterceptorInstance.get(
    `/users/${user_uuid}/leave-requests/${leave_request_uuid}`,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
