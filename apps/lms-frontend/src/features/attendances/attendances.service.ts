import axiosInterceptorInstance from "@/config/axios";

export const getUserAttendanceService = (
    org_uuid: string,
    user_uuid: string
) => {
  return axiosInterceptorInstance.get(
    `/organizations/attendances/${user_uuid}`,
    {
      headers: {
        org_uuid,
      },
    }
  );
};