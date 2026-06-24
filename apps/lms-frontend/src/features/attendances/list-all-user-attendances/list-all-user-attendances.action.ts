import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { ListAllUserAttendancesPayload } from "./list-all-user-attendances.type";
import { listAllUserAttendancesService } from "./list-all-user-attendances.service";


export const listAllUserAttendancesAction = createAsyncThunk(
  AttendanceActionType.LIST_ALL_USER_ATTENDANCE,
  async (payload: ListAllUserAttendancesPayload, { rejectWithValue }) => {
    try {
      const response = await listAllUserAttendancesService(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
