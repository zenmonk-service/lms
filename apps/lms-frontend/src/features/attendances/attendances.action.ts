import { createAsyncThunk } from "@reduxjs/toolkit";
import { checkInType, checkOutType, getUserAttendanceType, getUserTodayAttendanceType } from "./attendances.type";
import { checkInService, checkOutService, getUserAttendanceService, getUserTodayAttendanceService } from "./attendances.service";

export const getUserTodayAttendancesAction = createAsyncThunk(
   getUserTodayAttendanceType ,
    async ({org_uuid ,user_uuid}: {org_uuid: string, user_uuid: string }, { rejectWithValue }) => {
        try {
            const response = await getUserTodayAttendanceService(org_uuid , user_uuid);
            return response.data;
        } catch (error :any) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const getUserAttendancesAction = createAsyncThunk(
   getUserAttendanceType ,
    async ({org_uuid ,user_uuid, date_range, page, limit}: {org_uuid: string, user_uuid: string, date_range ?: any , page :number ,limit : number }, { rejectWithValue }) => {
        try {
            const response = await getUserAttendanceService(org_uuid , user_uuid, date_range ,page ,limit);
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