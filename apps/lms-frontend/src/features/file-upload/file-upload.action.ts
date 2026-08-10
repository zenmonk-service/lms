import { createAsyncThunk } from "@reduxjs/toolkit";
import { fileUpload } from "./file-upload.service";
import { toastSuccess } from "@/shared/toast/toast-success";

export const fileUploadAction = createAsyncThunk(
  "file/upload",
  async (payload: FormData, thunkAPI) => {
    try {
      const response = await fileUpload(payload);
      toastSuccess("File uploaded successfully");
      return await response.json();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data);
    }
  }
);

