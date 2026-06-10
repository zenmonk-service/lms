import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUserData,
  getAllOrganizations,
  getOrganizationSettingsService,
  updateOrganizationSettingsService,
  getOrganizationById,
  createOrganizationEvent,
  getOrganizationEvent,
  updateOrganizationEvent,
  deleteOrganizationEvent,
} from "./organizations.service";
import { OrganizationFetchPayload } from "./organizations.type";
import { toastError } from "@/shared/toast/toast-error";

// ========== ORGANIZATION ACTIONS ==========

// Get all organizations
export const getOrganizationsAction = createAsyncThunk(
  "user/organizations/getAll",
  async (payload: OrganizationFetchPayload, thunkAPI) => {
    try {
      const response = await getOrganizations(payload);
      return {
        ...response.data,
        page: payload.page || 1,
      };
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const getAllOrganizationsAction = createAsyncThunk(
  "organizations/getAll",
  async (payload: OrganizationFetchPayload, thunkAPI) => {
    try {
      const response = await getAllOrganizations(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const getOrganizationUserDataAction = createAsyncThunk(
  "organizations/get",
  async (payload: { organizationId: string; email: string }, thunkAPI) => {
    try {
      const response = await getOrganizationUserData(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const getOrganizationByIdAction = createAsyncThunk(
  "organizations/getById",
  async (org_uuid: string, thunkAPI) => {
    try {
      const response = await getOrganizationById(org_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

// Create organization
export const createOrganizationAction = createAsyncThunk(
  "organizations/create",
  async (organizationInfo: any, thunkAPI) => {
    try {
      const response = await createOrganization(organizationInfo);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

// Update organization
export const updateOrganizationAction = createAsyncThunk(
  "organizations/update",
  async (
    {
      organizationId,
      organizationInfo,
    }: { organizationId: string; organizationInfo: any },
    thunkAPI,
  ) => {
    try {
      const response = await updateOrganization(
        organizationId,
        organizationInfo,
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

// Delete organization
export const deleteOrganizationAction = createAsyncThunk(
  "organizations/delete",
  async (organizationId: string, thunkAPI) => {
    try {
      const response = await deleteOrganization(organizationId);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const getOrganizationSettings = createAsyncThunk(
  "organizations/get-settings",
  async (org_uuid: string, thunkAPI) => {
    try {
      const response = await getOrganizationSettingsService(org_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const updateOrganizationSettings = createAsyncThunk(
  "organizations/update-settings",
  async (data: any, thunkAPI) => {
    try {
      const { org_uuid, settings } = data;
      const response = await updateOrganizationSettingsService(
        org_uuid,
        settings,
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const getOrganizationEventAction = createAsyncThunk(
  "organizations/get-event",
  async (data: any, thunkAPI) => {
    try {
      const response = await getOrganizationEvent(data.org_uuid, data.year);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const createOrganizationEventAction = createAsyncThunk(
  "organizations/create-event",
  async (data: any, thunkAPI) => {
    try {
      const response = await createOrganizationEvent(
        data.org_uuid,
        data.payload,
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const updateOrganizationEventAction = createAsyncThunk(
  "organizations/update-event",
  async (data: any, thunkAPI) => {
    try {
      const { org_uuid, event_uuid, payload } = data;
      const response = await updateOrganizationEvent(
        org_uuid,
        event_uuid,
        payload,
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const deleteOrganizationEventAction = createAsyncThunk(
  "organizations/delete-event",
  async (data: any, thunkAPI) => {
    try {
      const { org_uuid, event_uuid } = data;
      const response = await deleteOrganizationEvent(org_uuid, event_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);
