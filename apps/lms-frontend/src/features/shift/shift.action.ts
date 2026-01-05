import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOrganizationShiftsService,
  listOrganizationShiftsService,
} from "./shift.service";
import { AxiosError } from "axios";
import { toastError } from "@/shared/toast/toast-error";
import {
  createOrganizationShiftType,
  CreateShiftPayload,
  listOrganizationShiftsType,
  ListShift,
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

export const createOrganizationShiftsAction = createAsyncThunk(
  createOrganizationShiftType,
  async (payload: CreateShiftPayload, thunkAPI) => {
    const { org_uuid, ...shiftData } = payload;
    try {
      const response = await createOrganizationShiftsService(
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
