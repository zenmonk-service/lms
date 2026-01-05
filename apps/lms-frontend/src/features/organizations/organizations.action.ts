import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  updateOrganizationUser,
  deleteOrganizationUser,
  getOrganizationUserData,
  getAllOrganizations,
  activateUser,
  deactivateUser,
  getOrganizationSettingsService,
  updateOrganizationSettingsService,
  getOrganizationById,
  createOrganizationEvent,
  getOrganizationEvent,
  updateOrganizationEvent,
  deleteOrganizationEvent,
} from "./organizations.service";
import { OrganizationFetchPayload } from "./organizations.type";
import { createUser } from "../user/user.service";
import { CreateUserPayload } from "../user/user.type";
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
  }
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
  }
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
  }
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
  }
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
  }
);

// Update organization
export const updateOrganizationAction = createAsyncThunk(
  "organizations/update",
  async (
    {
      organizationId,
      organizationInfo,
    }: { organizationId: string; organizationInfo: any },
    thunkAPI
  ) => {
    try {
      const response = await updateOrganization(
        organizationId,
        organizationInfo
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
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
  }
);

// ========== USER ACTIONS ==========

// Get users in organization
export const getUsersAction = createAsyncThunk(
  "users/getAll",
  async (organizationId: string, thunkAPI) => {
    try {
      const response = await getOrganizationUsers(organizationId, {});
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Create user
export const createUserAction = createAsyncThunk(
  "users/create",
  async (payload: CreateUserPayload , thunkAPI) => {
    try {
      const response = await createUser(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Update user
export const updateUserAction = createAsyncThunk(
  "users/update",
  async (
    { organizationId, userInfo }: { organizationId: string; userInfo: any },
    thunkAPI
  ) => {
    try {
      const response = await updateOrganizationUser(organizationId, userInfo);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Delete user
export const deleteUserAction = createAsyncThunk(
  "users/delete",
  async (
    { organizationId, userInfo }: { organizationId: string; userInfo: any },
    thunkAPI
  ) => {
    try {
      const response = await deleteOrganizationUser(organizationId, userInfo);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const activateUserAction = createAsyncThunk(
  "organization/activate-user",
  async (data: any, thunkAPI) => {
    try {
      const response = await activateUser(data.org_uuid, data.user_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const deactivateUserAction = createAsyncThunk(
  "orgnization/deactivate-user",
  async (data: any, thunkAPI) => {
    try {
      const response = await deactivateUser(data.org_uuid, data.user_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
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
  }
);

export const updateOrganizationSettings = createAsyncThunk(
  "organizations/update-settings",
  async (data: any, thunkAPI) => {
    try {
      const { org_uuid, settings } = data;
      const response = await updateOrganizationSettingsService(
        org_uuid,
        settings
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const getOrganizationEventAction = createAsyncThunk(
  "organizations/get-event",
  async (data: any, thunkAPI) => {
    try {
      const response = await getOrganizationEvent(data.org_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const createOrganizationEventAction = createAsyncThunk(
  "organizations/create-event",
  async (data: any, thunkAPI) => {
    try {
      const response = await createOrganizationEvent(
        data.org_uuid,
        data.payload
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const updateOrganizationEventAction = createAsyncThunk(
  "organizations/update-event",
  async (data: any, thunkAPI) => {
    try {
      const { org_uuid, event_uuid, payload } = data;
      const response = await updateOrganizationEvent(
        org_uuid,
        event_uuid,
        payload
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const deleteOrganizationEventAction = createAsyncThunk(
  "organizations/delete-event",
  async (data: any, thunkAPI) => {
    try {
      const { org_uuid, event_uuid } = data;
      const response = await deleteOrganizationEvent(
        org_uuid,
        event_uuid,
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);