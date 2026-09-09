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
import { UserInterface } from "@/features/user/user.type";
import { getUserAction } from "@/features/user/get-user/get-user.action";
import { setCurrentUser } from "@/features/user/user.slice";
import { useSession } from "next-auth/react";

export function AppSidebar({ uuid }: { uuid: string }) {
  const dispatch = useAppDispatch();
  const { setTheme } = useTheme();
  const { update } = useSession();
  const { organizationSettings, currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const items = useSidebarItems(uuid);

  useEffect(() => {
    const fetchOrgSettings = () =>
      dispatch(getOrganizationSettingsAction({ org_uuid: uuid }));

    fetchOrgSettings();

    // Firefox restores this page from the back/forward cache without re-running
    // effects, so a theme changed elsewhere while the page was frozen never
    // reaches the client. Re-pull settings on a persisted restore so the theme
    // effect below re-fires with the current value.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) fetchOrgSettings();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [dispatch, uuid]);

  useEffect(() => {
    if (organizationSettings?.theme?.value) {
      setTheme(organizationSettings.theme.value);
    }
  }, [organizationSettings?.theme?.value]);

  function toSessionPayload(user: UserInterface, org_uuid: string) {
    const { role } = user;
    return {
      org_uuid,
      name: user.name,
      email: user.email,
      image: user.image || null,
      role: {
        id: role.id,
        uuid: role.uuid,
        name: role.name,
        description: role.description,
      },
    };
  }

  useEffect(() => {
    dispatch(
      getUserAction({
        org_uuid: currentOrganization.uuid,
        user_uuid: currentUser?.user_id,
      }),
    )
      .unwrap()
      .then((user) => {
        dispatch(setCurrentUser(user));
        update(toSessionPayload(user, currentOrganization.uuid));
         dispatch(
        listRolePermissionsAction({
          org_uuid: uuid,
          role_uuid: user.role.uuid,
          isCurrentUserRolePermissions: true,
        }),
      );
      })
      .catch(() => {});
  }, [dispatch, currentOrganization.uuid]);


  return (
    <Sidebar>
      <SidebarOrgSwitcher />
      <SidebarContent className="no-scrollbar">
        <SidebarNav items={items} />
      </SidebarContent>
    </Sidebar>
  );
}
