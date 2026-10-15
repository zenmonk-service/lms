import { organizationsReducer } from "@/features/organizations/organizations.slice";
import { rolesReducer } from "@/features/role/role.slice";
import { userReducer } from "@/features/user/user.slice";
import { leaveReducer } from "@/features/leave/leave.slice";
import { attendancesReducer } from "@/features/attendances/attendances.slice";
import { permissionsReducer } from "@/features/permissions/permission.slice";
import { notificationReducer } from "@/features/notifications/notification.slice";
import { payrollReducer } from "@/features/payroll/payroll.slice";
import type { Reducer, UnknownAction } from "redux";

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
import { fileUploadReducer } from "@/features/file-upload/file-upload.slice";
import { shiftsReducer } from "@/features/shift/shift.slice";
import { holidaysReducer } from "@/features/holidays/holidays.slice";

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

const resettable = <S>(reducer: Reducer<S>): Reducer<S> => {
  return (state, action: UnknownAction) =>
    reducer(resetStore.match(action) ? undefined : state, action);
};
const combinedReducer = combineSlices({
  userSlice: persistReducer(
    userPersistConfig,
    resettable(userReducer),
  ),

  organizationsSlice: persistReducer(
    organizationsPersistConfig,
    resettable(organizationsReducer),
  ),

  permissionSlice: persistReducer(
    permissionPersistConfig,
    resettable(permissionsReducer),
  ),

  rolesSlice: resettable(rolesReducer),
  leaveSlice: resettable(leaveReducer),
  fileSlice: resettable(fileUploadReducer),
  attendancesSlice: resettable(attendancesReducer),
  shiftSlice: resettable(shiftsReducer),
  holidaysSlice: resettable(holidaysReducer),
  notificationSlice: resettable(notificationReducer),
  payrollSlice: resettable(payrollReducer),
});

export const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined,
  action: Action,
) => {
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
