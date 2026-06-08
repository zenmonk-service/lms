import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteUserLeaveRequestPayload } from "./delete-user-leave-request.types";
import { deleteUserLeaveRequest } from "./delete-user-leave-request.service";

export const deleteUserLeaveRequestAction = createAsyncThunk(
  "user/delete-user-leave-requests",
  async (data: DeleteUserLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await deleteUserLeaveRequest(data);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
