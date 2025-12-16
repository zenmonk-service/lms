import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  activateLeaveType,
  createLeaveType,
  deactivateLeaveType,
  getLeaveTypes,
  updateLeaveType,
} from "./leave-types.service";
import { AxiosError } from "axios";
import { toastError } from "@/shared/toast/toast-error";

export const getLeaveTypesAction = createAsyncThunk(
  "organizations/getLeaveTypes",
  async (
    payload: {
      org_uuid: string;
      page?: number;
      limit?: number;
      search?: string;
    },
    thunkAPI
  ) => {
    try {
      const { org_uuid, page = 1, limit = 10, search } = payload;
      const response = await getLeaveTypes(org_uuid, { page, limit, search });
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const createLeaveTypeAction = createAsyncThunk(
  "orgnization/leave-type",
  async (data: any, thunkAPI) => {
    try {
      const response = await createLeaveType(data, data.org_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const updateLeaveTypeAction = createAsyncThunk(
  "orgnization/update-leave-type",
  async (data: any, thunkAPI) => {
    try {
      const response = await updateLeaveType(data, data.org_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const activateLeaveTypeAction = createAsyncThunk(
  "orgnization/activate-leave-type",
  async (data: any, thunkAPI) => {
    try {
      const response = await activateLeaveType(
        data.org_uuid,
        data.leave_type_uuid
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const deactivateLeaveTypeAction = createAsyncThunk(
  "orgnization/deactivate-leave-type",
  async (data: any, thunkAPI) => {
    try {
      const response = await deactivateLeaveType(
        data.org_uuid,
        data.leave_type_uuid
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);
