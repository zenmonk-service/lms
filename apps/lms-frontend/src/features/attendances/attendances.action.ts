import axiosInterceptorInstance from "@/config/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { checkInType, checkOutType, getUserAttendanceType } from "./attendances.type";
import { get } from "http";
import { checkInService, checkOutService, getUserAttendanceService } from "./attendances.service";

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

export const checkInAction = createAsyncThunk(
   checkInType ,
    async ({org_uuid ,user_uuid}: {org_uuid: string, user_uuid: string }, { rejectWithValue }) => {
        try {
            const response = await checkInService(org_uuid , user_uuid);
            return response.data;
        } catch (error :any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const checkOutAction = createAsyncThunk(
   checkOutType ,
    async ({org_uuid ,user_uuid}: {org_uuid: string, user_uuid: string }, { rejectWithValue }) => {
        try {
            const response = await checkOutService(org_uuid , user_uuid);
            return response.data;
        } catch (error :any) {
            return rejectWithValue(error.response.data);
        }
    }
);