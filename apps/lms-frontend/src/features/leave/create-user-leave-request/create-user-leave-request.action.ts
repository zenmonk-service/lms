import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateLeaveRequestPayload } from "./create-user-leave-request.types";
import { createUserLeaveRequests } from "./create-user-leave-request.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const createUserLeaveRequestAction = createAsyncThunk(
  LeaveActionType.CREATE_USER_LEAVE_REQUEST,
  async (payload: CreateLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await createUserLeaveRequests(payload);
      toastSuccess("Leave request created successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
