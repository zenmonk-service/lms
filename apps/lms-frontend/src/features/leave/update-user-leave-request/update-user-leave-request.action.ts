import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateUserLeaveRequestPayload } from "./update-user-leave-request.types";
import { updateLeaveRequest } from "./update-user-leave-request.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const updateUserLeaveRequestAction = createAsyncThunk(
  LeaveActionType.UPDATE_USER_LEAVE_REQUEST,
  async (payload: UpdateUserLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await updateLeaveRequest(payload);
      toastSuccess("Leave request updated successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
