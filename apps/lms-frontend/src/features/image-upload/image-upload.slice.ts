import { createSlice } from "@reduxjs/toolkit";
import { imageUploadAction } from "./image-upload.action";

interface ImageUploadState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ImageUploadState = {
  isLoading: false,
  error: null,
};

const imageSlice = createSlice({
  name: "imageUpload",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(imageUploadAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(imageUploadAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(imageUploadAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to upload image";
      });
  },
});

export const imageUploadReducer = imageSlice.reducer;
