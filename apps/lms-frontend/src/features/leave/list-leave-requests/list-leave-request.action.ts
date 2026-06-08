import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listLeaveRequests } from "./list-leave-requests.service";
import { ListLeaveRequestsPayload } from "./list-leave-requests.types";

export const listLeaveRequestsAction = createAsyncThunk(
  "orgnization/leave-requests",
  async (data: ListLeaveRequestsPayload, thunkAPI) => {
    try {
      const response = await listLeaveRequests(data);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
