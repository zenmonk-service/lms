import axiosInterceptorInstance from "@/config/axios";
import { OrganizationFetchPayload } from "./organizations.type";

export const getOrganizations = (payload: OrganizationFetchPayload) => {
  return axiosInterceptorInstance.get(`/users/${payload.uuid}/organizations`, {
    params: {
      page: payload.page,
      limit: payload.limit,
      search: payload.search,
    },
  });
};

export const getAllOrganizations = (payload: OrganizationFetchPayload) => {
  return axiosInterceptorInstance.get(`/organizations`, {
    params: {
      page: payload.page,
      limit: payload.limit,
      search: payload.search,
    },
  });
};

export const getOrganizationUserData = (payload: {
  organizationId: string;
  email: string;
}) => {
  return axiosInterceptorInstance.post(`/organizations/login`, payload);
};

export const getOrganizationById = (org_uuid: string) => {
  return axiosInterceptorInstance.get(`/organizations/${org_uuid}`);
};

export const createOrganization = (organizationInfo: any) => {
  return axiosInterceptorInstance.post(`/organizations`, organizationInfo);
};

export const updateOrganization = (
  organizationId: string,
  organizationInfo: any
) => {
  return axiosInterceptorInstance.put(
    `/organizations/${organizationId}`,
    organizationInfo
  );
};

export const deleteOrganization = (organizationId: string) => {
  return axiosInterceptorInstance.delete(`/organizations/${organizationId}`);
};

export const getOrganizationUsers = (organizationId: string, userInfo: any) => {
  return axiosInterceptorInstance.get(
    `/organizations/${organizationId}/users`,
    userInfo
  );
};

export const createOrganizationUser = (
  organizationId: string,
  userInfo: any
) => {
  return axiosInterceptorInstance.post(
    `/organizations/${organizationId}/users`,
    userInfo
  );
};

export const updateOrganizationUser = (
  organizationId: string,
  userInfo: any
) => {
  return axiosInterceptorInstance.post(
    `/organizations/${organizationId}/users`,
    userInfo
  );
};

export const deleteOrganizationUser = (
  organizationId: string,
  userInfo: any
) => {
  return axiosInterceptorInstance.post(
    `/organizations/${organizationId}/users`,
    userInfo
  );
};

export const getRoles = (org_uuid: string) => {
  return axiosInterceptorInstance.get(`/organizations/roles`, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const activateUser = (org_uuid: string, user_uuid: string) => {
  return axiosInterceptorInstance.patch(`/users/${user_uuid}/activate`, null, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const deactivateUser = (org_uuid: string, user_uuid: string) => {
  return axiosInterceptorInstance.patch(
    `/users/${user_uuid}/deactivate`,
    null,
    {
      headers: {
        org_uuid: org_uuid,
      },
    }
  );
};

export const getOrganizationSettingsService = (org_uuid: string) => {
  return axiosInterceptorInstance.get(`/organizations/settings`, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const updateOrganizationSettingsService = (
  org_uuid: string,
  settings: any
) => {
  return axiosInterceptorInstance.put(`/organizations/settings`, settings, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const getOrganizationEvent = (org_uuid: string) => {
  return axiosInterceptorInstance.get(`/organizations/events`, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const createOrganizationEvent = (org_uuid: string, payload: any) => {
  return axiosInterceptorInstance.post(
    `/organizations/events`,
    payload,
    {
      headers: {
        org_uuid: org_uuid,
      },
    }
  );
};
