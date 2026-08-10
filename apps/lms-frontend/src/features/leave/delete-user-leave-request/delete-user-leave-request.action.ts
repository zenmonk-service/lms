import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteUserLeaveRequestPayload } from "./delete-user-leave-request.types";
import { deleteUserLeaveRequest } from "./delete-user-leave-request.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const deleteUserLeaveRequestAction = createAsyncThunk(
  LeaveActionType.DELETE_USER_LEAVE_REQUEST,
  async (payload: DeleteUserLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await deleteUserLeaveRequest(payload);
      toastSuccess("Leave request deleted successfully");
      return response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
