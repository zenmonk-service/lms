import axiosInterceptorInstance from "@/config/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserAttendanceType } from "./attendances.type";
import { get } from "http";
import { getUserAttendanceService } from "./attendances.service";

export const getUserAttendancesAction = createAsyncThunk(
   getUserAttendanceType ,
    async ({org_uuid ,user_uuid}: {org_uuid: string, user_uuid: string }, { rejectWithValue }) => {
        try {
            const response = await getUserAttendanceService(org_uuid , user_uuid);
            return response.data;
        } catch (error :any) {
            return rejectWithValue(error.response.data);
        }
    }
);