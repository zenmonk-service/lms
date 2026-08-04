import { createAsyncThunk } from "@reduxjs/toolkit";
import { imageUpload } from "./image-upload.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";

export const imageUploadAction = createAsyncThunk(
  "image/imageUpload",
  async (payload: FormData, thunkAPI) => {
    try {
      const response = await imageUpload(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
