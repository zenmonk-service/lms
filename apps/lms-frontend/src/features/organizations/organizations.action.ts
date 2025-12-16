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
  getOrganizationsById,
  getAllOrganizations,
  activateUser,
  deactivateUser,
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
// Get organization by id
export const getOrganizationById = createAsyncThunk(
  "organizations/get",
  async (payload: { organizationId: string; email: string }, thunkAPI) => {
    try {
      const response = await getOrganizationsById(payload);
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
  async (payload: CreateUserPayload, thunkAPI) => {
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
