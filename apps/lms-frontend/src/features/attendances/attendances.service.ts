import axiosInterceptorInstance from "@/config/axios";

export const getUserTodayAttendanceService = (
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

export const getUserAttendanceService = (
    org_uuid: string,
    user_uuid: string,
    date_range ?: any,
    page ?: number,
    limit ?: number
) => {
  return axiosInterceptorInstance.get(
    `/organizations/attendances`,
    {
      params: { user_uuid ,date_range, page, limit },
      headers: {
        org_uuid,
      },
    }
  );
};

export const checkInService = (
    org_uuid: string,
    user_uuid: string,
    geolocation?: { latitude: number; longitude: number }
) => {
  return axiosInterceptorInstance.patch(
    `/organizations/attendances/${user_uuid}/check-in`,
    geolocation ? { geolocation } : {},
    {
      headers: {
        org_uuid,
      },
    }
  );
};


export const checkOutService = (
    org_uuid: string,
    user_uuid: string,
    geolocation?: { latitude: number; longitude: number }
) => {
  return axiosInterceptorInstance.patch(
    `/organizations/attendances/${user_uuid}/check-out`,
    geolocation ? { geolocation } : {},
    {
      headers: {
        org_uuid,
      },
    }
  );
};