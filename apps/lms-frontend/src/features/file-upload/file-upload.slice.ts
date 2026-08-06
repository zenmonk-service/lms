import { createSlice } from "@reduxjs/toolkit";
import { fileUploadAction } from "./file-upload.action";

interface ImageUploadState {
  isLoading: boolean;
  error: string | null;
  fileURL: string | null;
}

const initialState: ImageUploadState = {
  isLoading: false,
  error: null,
  fileURL: null,
};

const fileSlice = createSlice({
  name: "fileUpload",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fileUploadAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fileUploadAction.fulfilled, (state, action) => {
        state.fileURL = action.payload || null;
        state.isLoading = false;
      })
      .addCase(fileUploadAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to upload image";
      });
  },
});

export const fileUploadReducer = fileSlice.reducer;
