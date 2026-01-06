import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOrganizationShiftService,
  deleteOrganizationShiftService,
  listOrganizationShiftsService,
  updateOrganizationShiftService,
} from "./shift.service";
import { AxiosError } from "axios";
import { toastError } from "@/shared/toast/toast-error";
import {
  createOrganizationShiftType,
  CreateShiftPayload,
  deleteOrganizationShiftType,
  listOrganizationShiftsType,
  updateOrganizationShiftType,
  UpdateShiftPayload,
} from "./shift.type";

export const listOrganizationShiftsAction = createAsyncThunk(
  listOrganizationShiftsType,
  async (org_uuid: string, thunkAPI) => {
    try {
      const response = await listOrganizationShiftsService(org_uuid);
      return response.data;
    } catch (err: any) {
      toastError(err?.response?.data?.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const updateOrganizationShiftAction = createAsyncThunk(
  updateOrganizationShiftType,
  async (payload: UpdateShiftPayload, thunkAPI) => {
    const { org_uuid, uuid, ...shiftData } = payload;
    try {
      const response = await updateOrganizationShiftService(
        org_uuid,
        uuid,
        shiftData
      );
      return response.data;
    } catch (err: any) {
      toastError(err?.response?.data?.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const deleteOrganizationShiftAction = createAsyncThunk(
  deleteOrganizationShiftType,
  async (payload: { org_uuid: string; uuid: string }, thunkAPI) => {
    const { org_uuid, uuid } = payload;
    try {
      const response = await deleteOrganizationShiftService(org_uuid, uuid);
      return response.data;
    } catch (err: any) {
      toastError(err?.response?.data?.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const createOrganizationShiftAction = createAsyncThunk(
  createOrganizationShiftType,
  async (payload: CreateShiftPayload, thunkAPI) => {
    const { org_uuid, ...shiftData } = payload;
    try {
      const response = await createOrganizationShiftService(
        org_uuid,
        shiftData
      );
      return response.data;
    } catch (err: any) {
      toastError(err?.response?.data?.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
