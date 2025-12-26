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

export const checkInService = (
    org_uuid: string,
    user_uuid: string
) => {
  return axiosInterceptorInstance.patch(
    `/organizations/attendances/${user_uuid}/check-in`,
    {},
    {
      headers: {
        org_uuid,
      },
    }
  );
};


export const checkOutService = (
    org_uuid: string,
    user_uuid: string
) => {
  return axiosInterceptorInstance.patch(
    `/organizations/attendances/${user_uuid}/check-out`,
    {},
    {
      headers: {
        org_uuid,
      },
    }
  );
};