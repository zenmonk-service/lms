import { createSlice } from "@reduxjs/toolkit";
import { imageUploadAction } from "./image-upload.action";

interface ImageUploadState {
  isLoading: boolean;
  error: string | null;
  imageURL: string | null;  
}

const initialState: ImageUploadState = {
  isLoading: false,
  error: null,
  imageURL: null,
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
      .addCase(imageUploadAction.fulfilled, (state, action) => {
        state.imageURL = action.payload || null;
        state.isLoading = false;
      })
      .addCase(imageUploadAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to upload image";
      });
  },
});

export const imageUploadReducer = imageSlice.reducer;
