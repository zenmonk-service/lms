import { createSlice } from "@reduxjs/toolkit";
import { OrganizationState } from "./organizations.types";
import { listUserOrganizationsAction } from "./list-user-organizations/list-user-organizations.action";
import { listOrganizationsAction } from "./list-organizations/list-organization.action";
import { getOrganizationAction } from "./get-organization/get-organization.action";
import { createOrganizationAction } from "./create-organization/create-organization.action";
import { updateOrganizationAction } from "./update-organization/update-organization.action";
import { deleteOrganizationAction } from "./delete-organization/delete-organization.action";
import { getOrganizationSettingsAction } from "./get-organization-settings/get-organization-settings.action";
import { updateOrganizationSettingsAction } from "./update-organization-settings/update-organization-settings.action";
import { createOrganizationEventAction } from "./create-organization-event/create-organization-event.action";
import { listOrganizationEventsAction } from "./list-organization-events/list-organization-events.action";
import { deleteOrganizationEventAction } from "./delete-organization-event/delete-organization-event.action";
import { updateOrganizationEventAction } from "./update-organization-event/update-organization-event.action";
import { loginOrganizationAction } from "./login-organization/login-organization.action";


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
      .addCase(listUserOrganizationsAction.pending, (state) => {
        state.isOrgLoading = true;
        state.error = null;
      })
      .addCase(listUserOrganizationsAction.fulfilled, (state, action) => {
        state.isOrgLoading = false;
        state.organizations = action.payload.rows || [];
        state.count = action.payload.count || 0;
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.current_page || 0;
      })
      .addCase(listUserOrganizationsAction.rejected, (state, action) => {
        state.isOrgLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      })

      .addCase(listOrganizationsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listOrganizationsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizations = action.payload.rows || [];
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.current_page || 0;
      })
      .addCase(listOrganizationsAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      })

      .addCase(loginOrganizationAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginOrganizationAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrganizationAndUser = action.payload;
      })
      .addCase(loginOrganizationAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      })

      .addCase(getOrganizationAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(getOrganizationAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      })

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
      })

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
      })

      .addCase(deleteOrganizationAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrganizationAction.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.meta.arg; // because we pass organizationId directly
        state.organizations = state.organizations.filter(
          (org) => org.id !== deletedId,
        );
      })
      .addCase(deleteOrganizationAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to delete organization";
      })

      .addCase(getOrganizationSettingsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationSettingsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizationSettings = action.payload;
      })
      .addCase(getOrganizationSettingsAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })

      .addCase(updateOrganizationSettingsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrganizationSettingsAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(
        updateOrganizationSettingsAction.rejected,
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.payload?.message;
        },
      )

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

      .addCase(listOrganizationEventsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listOrganizationEventsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.organizationEvents = action.payload.rows || [];
      })
      .addCase(listOrganizationEventsAction.rejected, (state, action: any) => {
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
      .addCase(updateOrganizationEventAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateOrganizationEventAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      });
  },
});

export const organizationsReducer = organizationsSlice.reducer;
export const { resetOrganizationsState, setCurrentOrganization } =
  organizationsSlice.actions;
