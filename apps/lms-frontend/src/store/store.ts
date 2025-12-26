import { organizationsReducer } from "@/features/organizations/organizations.slice";
import { rolesReducer } from "@/features/role/role.slice";
import { userReducer } from "@/features/user/user.slice";
import leaveTypeReducer from "@/features/leave-types/leave-types.slice";
import leaveRequestReducer from "@/features/leave-requests/leave-requests.slice";
import { permissionsReducer } from "@/features/permissions/permission.slice";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import persistReducer from "redux-persist/es/persistReducer";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import { resetStore } from "./reset-store-action";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import type { Action } from "@reduxjs/toolkit";
import { imageUploadReducer } from "@/features/image-upload/image-upload.slice";

const storage = createWebStorage("local");

const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["currentUser"],
};

const permissionPersistConfig = {
  key: "permission",
  storage,
  whitelist: ["currentUserRolePermissions"],
};

const organizationsPersistConfig = {
  key: "organizations",
  storage,
  whitelist: ["organizations", "currentOrganization"],
};

const combinedReducer = combineSlices({
  userSlice: persistReducer(userPersistConfig, userReducer),
  organizationsSlice: persistReducer(organizationsPersistConfig, organizationsReducer),
  rolesSlice: rolesReducer,
  permissionSlice: persistReducer(permissionPersistConfig, permissionsReducer),
  leaveTypeSlice: leaveTypeReducer,
  leaveRequestSlice: leaveRequestReducer,
  imageUploadSlice: imageUploadReducer
});

export const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: Action
) => {
  if (action.type === resetStore.type) {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];





