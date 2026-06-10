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



export const getRoles = (org_uuid: string) => {
  return axiosInterceptorInstance.get(`/organizations/roles`, {
    headers: {
      org_uuid: org_uuid,
    },
  });
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

export const getOrganizationEvent = (org_uuid: string , year: number) => {
  return axiosInterceptorInstance.get(`/organizations/events`, {
    headers: {
      org_uuid: org_uuid,
    },
    params: {
      year: year
    }
  });
};

export const createOrganizationEvent = (org_uuid: string, payload: any) => {
  return axiosInterceptorInstance.post(`/organizations/events`, payload, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const deleteOrganizationEvent = (
  org_uuid: string,
  event_uuid: string
) => {
  return axiosInterceptorInstance.delete(
    `/organizations/events/${event_uuid}`,
    {
      headers: {
        org_uuid: org_uuid,
      },
    }
  );
};

export const updateOrganizationEvent = (
  org_uuid: string,
  event_uuid: string,
  payload: any
) => {
  return axiosInterceptorInstance.put(
    `/organizations/events/${event_uuid}`,
    payload,
    {
      headers: {
        org_uuid: org_uuid,
      },
    }
  );
};
