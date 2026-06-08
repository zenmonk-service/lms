import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserLeaveRequest } from "./get-user-leave-request.service";
import { GetUserLeaveRequestPayload } from "./get-user-leave-request.types";

export const getUserLeaveRequestAction = createAsyncThunk(
  "organization/user-leave-request",
  async (data: GetUserLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await getUserLeaveRequest(
        data.org_uuid,
        data.user_uuid,
        data.leave_request_uuid
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);