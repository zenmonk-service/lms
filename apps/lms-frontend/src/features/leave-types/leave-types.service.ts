import axiosInterceptorInstance from "@/config/axios";

export const getLeaveTypes = (
  org_uuid: string,
  params?: { page?: number; limit?: number; search?: string }
) => {
  return axiosInterceptorInstance.get(`/organizations/leave-types`, {
    params,
    headers: {
      org_uuid,
    },
  });
};

export const createLeaveType = (data: any, org_uuid: string) => {
  return axiosInterceptorInstance.post(`/organizations/leave-types`, data, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const updateLeaveType = (data: any, org_uuid: string) => {
  return axiosInterceptorInstance.put(`/organizations/leave-types`, data, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const activateLeaveType = (org_uuid: string, leave_type_uuid: string) => {
  return axiosInterceptorInstance.patch(
    `/organizations/leave-types/${leave_type_uuid}/activate`,
    {
      headers: {
        org_uuid,
      },
    }
  );
};

export const deactivateLeaveType = (org_uuid: string, leave_type_uuid: string) => {
  return axiosInterceptorInstance.patch(
    `/organizations/leave-types/${leave_type_uuid}/deactivate`,
    {
      headers: {
        org_uuid,
      },
    }
  );
};
