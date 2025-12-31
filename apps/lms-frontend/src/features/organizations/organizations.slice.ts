import { createSlice } from "@reduxjs/toolkit";
import {
  getOrganizationsAction,
  createOrganizationAction,
  updateOrganizationAction,
  deleteOrganizationAction,
  getOrganizationUserDataAction,
  getAllOrganizationsAction,
  activateUserAction,
  deactivateUserAction,
  createUserAction,
  getOrganizationSettings,
  updateOrganizationSettings,
  getOrganizationByIdAction,
  createOrganizationEventAction,
  getOrganizationEventAction,
  deleteOrganizationEventAction,
  updateOrganizationEventAction,
} from "./organizations.action";
import {
  DayStatus,
  OrgAttendanceMethod,
  UserIdPattern,
  WorkDays,
} from "./organizations.type";

export interface Organization {
  id: string;
  uuid: string;
  name: string;
  domain: string;
  description: string;
  roles: any[];
  is_active: boolean;
  logo_url: string | null;
}

interface OrganizationSettings {
  theme: {
    name: string;
    value: string;
    base: string;
  };
  work_days: WorkDays[];
  start_time: string;
  end_time: string;
  employee_id_pattern_type: UserIdPattern;
  employee_id_pattern_value: string;
  attendance_method: OrgAttendanceMethod;
}

interface OrganizationEvents {
  uuid: string;
  title: string;
  description?: string;
  day_status: DayStatus;
  start_date: Date;
  end_date: Date;
  band_color: string;
}

interface OrganizationState {
  isLoading: boolean;
  organizations: Organization[];
  organizationSettings: OrganizationSettings | null;
  currentOrganizationAndUser?: Organization;
  currentOrganization: Organization;
  organizationEvents: OrganizationEvents[];
  error: string | null;
  total: number;
  count: number;
  currentPage: number;
  isOrgLoading?: boolean;
  isOrgUpdating?: boolean;
}

const initialState: OrganizationState = {
  isLoading: false,
  organizations: [],
  currentOrganizationAndUser: undefined,
  currentOrganization: {
    id: "",
    uuid: "",
    name: "",
    domain: "",
    description: "",
    roles: [],
    is_active: false,
    logo_url: null,
  },
  organizationSettings: null,
  organizationEvents: [],
  error: null,
  total: 100,
  count: 0,
  currentPage: 1,
  isOrgLoading: false,
  isOrgUpdating: false,
};

export const organizationsSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    resetOrganizationsState: (state, action) => {
      if (state.organizations) state.organizations = [];
    },
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrganizationsAction.pending, (state) => {
        state.isOrgLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationsAction.fulfilled, (state, action) => {
        state.isOrgLoading = false;
        state.organizations = action.payload.rows || [];
        state.count = action.payload.count || 0;
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.current_page || 0;
      })
      .addCase(getOrganizationsAction.rejected, (state, action: any) => {
        state.isOrgLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      })
      .addCase(getAllOrganizationsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrganizationsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizations = action.payload.rows || [];
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.current_page || 0;
      })
      .addCase(getAllOrganizationsAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      })
      .addCase(getOrganizationUserDataAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationUserDataAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrganizationAndUser = action.payload;
      })
      .addCase(getOrganizationUserDataAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      })
      .addCase(getOrganizationByIdAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationByIdAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(getOrganizationByIdAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      });

    builder
      .addCase(createOrganizationAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganizationAction.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.organization) {
          state.organizations.push(action.payload.organization);
        }
      })
      .addCase(createOrganizationAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to create organization";
      });

    builder
      .addCase(updateOrganizationAction.pending, (state) => {
        state.isOrgUpdating = true;
        state.error = null;
      })
      .addCase(updateOrganizationAction.fulfilled, (state, action) => {
        state.isOrgUpdating = false;
      })
      .addCase(updateOrganizationAction.rejected, (state, action: any) => {
        state.isOrgUpdating = false;
        state.error =
          action.payload?.message || "Failed to update organization";
      });

    // Delete organization
    builder
      .addCase(deleteOrganizationAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrganizationAction.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.meta.arg; // because we pass organizationId directly
        state.organizations = state.organizations.filter(
          (org) => org.id !== deletedId
        );
      })
      .addCase(deleteOrganizationAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to delete organization";
      });

    builder
      .addCase(activateUserAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(activateUserAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(activateUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(deactivateUserAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deactivateUserAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deactivateUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(createUserAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(createUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(getOrganizationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizationSettings = action.payload;
      })
      .addCase(getOrganizationSettings.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(updateOrganizationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrganizationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateOrganizationSettings.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(createOrganizationEventAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganizationEventAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(createOrganizationEventAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(getOrganizationEventAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationEventAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizationEvents = action.payload.rows || [];
      })
      .addCase(getOrganizationEventAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(deleteOrganizationEventAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrganizationEventAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(deleteOrganizationEventAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(updateOrganizationEventAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrganizationEventAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateOrganizationEventAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      });
  },
});

export const organizationsReducer = organizationsSlice.reducer;
export const { resetOrganizationsState, setCurrentOrganization } =
  organizationsSlice.actions;
