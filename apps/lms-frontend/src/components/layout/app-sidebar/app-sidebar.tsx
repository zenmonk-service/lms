"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/store";
import { listRolePermissionsAction } from "@/features/permissions/list-role-permissions/list-role-permissions.action";
import { SidebarOrgSwitcher } from "./sidebar-org-switcher";
import { SidebarNav } from "./sidebar-nav";
import { useSidebarItems } from "./use-sidebar-items";
import { getOrganizationSettingsAction } from "@/features/organizations/get-organization-settings/get-organization-settings.action";

export function AppSidebar({ uuid }: { uuid: string }) {
  const dispatch = useAppDispatch();
  const { setTheme } = useTheme();
  const { organizationSettings } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const items = useSidebarItems(uuid);
  useEffect(() => {
    dispatch(getOrganizationSettingsAction({ org_uuid: uuid }));
  }, []);
  useEffect(() => {
    if (organizationSettings?.theme) {
      setTheme(organizationSettings.theme.value);
    }
  }, [organizationSettings]);

  useEffect(() => {
    if (currentUser?.role?.uuid) {
      dispatch(
        listRolePermissionsAction({
          org_uuid: uuid,
          role_uuid: currentUser.role.uuid,
          isCurrentUserRolePermissions: true,
        }),
      );
    }
  }, [currentUser.role?.uuid, uuid]);

  return (
    <Sidebar>
      <SidebarOrgSwitcher uuid={uuid} />
      <SidebarContent>
        <SidebarNav items={items} />
      </SidebarContent>
    </Sidebar>
  );
}
