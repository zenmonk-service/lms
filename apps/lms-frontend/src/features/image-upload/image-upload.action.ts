import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { imageUpload } from "./image-upload.service";

export const imageUploadAction = createAsyncThunk(
  "auth/imageUpload",
  async (payload: FormData, thunkAPI) => {
    try {
      const response = await imageUpload(payload);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

