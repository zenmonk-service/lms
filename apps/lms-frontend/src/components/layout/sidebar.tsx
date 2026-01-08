"use client";
import { persistor } from "@/store/store";
import { use, useEffect, useState, useTransition } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  ClipboardList,
  Plane,
  ChevronDown,
  BookCheck,
  Building2,
  LogOut,
  ChevronsUpDown,
  BadgeCheck,
  Bell,
  LoaderCircle,
  Settings,
  Loader2Icon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { listRolePermissionsAction } from "@/features/permissions/permission.action";
import { hasPermissions } from "@/lib/haspermissios";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { getSession } from "@/app/auth/get-auth.action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOutUser } from "@/app/auth/sign-out.action";
import {
  getOrganizationSettings,
  getOrganizationUserDataAction,
} from "@/features/organizations/organizations.action";
import { listUserAction } from "@/features/user/user.action";
import { setCurrentOrganization } from "@/features/organizations/organizations.slice";
import { useTheme } from "next-themes";
import { useResetTheme } from "@/hooks/use-reset-theme";

export function AppSidebar({ uuid }: { uuid: string }) {
  const resetTheme = useResetTheme();
  const { isMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentOrganization, isOrgUpdating } = useAppSelector(
    (state) => state.organizationsSlice
  );
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice
  );
  const { organizations, organizationSettings } = useAppSelector(
    (state) => state.organizationsSlice
  );

  function hasPagePermission(tag: string) {
    return currentUserRolePermissions?.some((perm) => perm.tag === tag);
  }
  const { data, update } = useSession();
  const { setTheme } = useTheme();

  const filterItemsByPermission = (items: any[]) => {
    return items;
    // .filter((item) => {
    //   if (item.tag) {
    //     if (item.title === "Approvals") {
    //       return (
    //         hasPagePermission(item.tag) &&
    //         hasPermissions(
    //           "leave_request_management",
    //           "approve",
    //           currentUserRolePermissions,
    //           currentUser?.email
    //         )
    //       );
    //     }
    //     return hasPagePermission(item.tag);
    //   }
    //   return true;
    // })
    // .map((item) => {
    //   if (item.items) {
    //     const filteredChildren: any = filterItemsByPermission(item.items);
    //     return filteredChildren.length > 0
    //       ? { ...item, items: filteredChildren }
    //       : null;
    //   }
    //   return item;
    // })
    // .filter(Boolean);
  };

  const [user, setUser] = useState<any>(null);

  async function getAuth() {
    const session = await getSession();
    setUser(session?.user);
  }

  useEffect(() => {
    getAuth();
    dispatch(getOrganizationSettings(uuid));
  }, []);

  useEffect(() => {
    if (organizationSettings?.theme) {
      setTheme(organizationSettings.theme.value);
    }
  }, [organizationSettings]);

  const items = filterItemsByPermission([
    {
      title: "Home",
      url: `/${uuid}/dashboard`,
      icon: Home,
    },
    {
      tag: "user_management",
      title: "User Management",
      url: `/${uuid}/user-management`,
      icon: Users,
    },
    {
      tag: "role_management",
      title: "Role Management",
      url: `/${uuid}/role-management`,
      icon: Users,
    },
    {
      tag: "org_management",
      title: "Organization Management",
      url: `/${uuid}/organization-management`,
      icon: Settings,
    },
    {
      tag: "schedule_management",
      title: "Schedule",
      url: `/${uuid}/schedule`,
      icon: Calendar,
    },
    {
      title: "Attendance Management",
      icon: Users,

      items: [
        {
          tag: "attendance_management",
          title: "Attendance",
          url: `/${uuid}/attendance`,
          icon: Users,
        },

        {
          tag: "attendance_management",
          title: "My Attendance",
          url: `/${uuid}/my-attendance`,
          icon: Plane,
        },
      ],
    },
    {
      title: "Leave Management",
      icon: Calendar,
      items: [
        {
          tag: "leave_type_management",
          title: "Leave Types",
          url: `/${uuid}/leave-types`,
          icon: ClipboardList,
        },
        {
          tag: "leave_request_management",
          title: "My Leaves",
          url: `/${uuid}/my-leaves`,
          icon: Plane,
        },
        {
          tag: "leave_request_management",
          title: "Approvals",
          url: `/${uuid}/approvals`,
          icon: BookCheck,
        },
      ],
    },
  ]);

  function SidebarNestedItem({ item }: { item: any }) {
    const [open, setOpen] = useState(true);

    if (item.items) {
      return (
        <SidebarMenuItem className="space-y-1">
          <SidebarMenuButton
            onClick={() => setOpen((prev) => !prev)}
            className="cursor-pointer hover:bg-sidebar-accent/50 transition-colors rounded-md px-2 py-1.5"
          >
            <div className="flex items-center gap-3 w-full">
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium flex-1">{item.title}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </SidebarMenuButton>

          <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-in-out w-full ${
              open ? "max-h-40" : "max-h-0"
            }`}
          >
            <SidebarMenu className="pl-4 w-full">
              {item?.items?.map((child: any) => (
                <SidebarMenuButton key={child.title} asChild className="w-full">
                  <Link
                    href={child.url}
                    className={`w-full truncate ${
                      pathname === child.url
                        ? "bg-sidebar-accent border-l-4 border-l-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/30"
                    }`}
                  >
                    <child.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{child.title}</span>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </div>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="px-2 py-1.5">
          <Link
            href={item.url}
            className={`rounded-md transition-all ${
              pathname === item.url
                ? "bg-sidebar-accent border-l-4 border-l-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/30"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  useEffect(() => {
    if (currentUser?.role?.uuid) {
      dispatch(
        listRolePermissionsAction({
          org_uuid: uuid,
          role_uuid: currentUser?.role?.uuid,
          isCurrentUserRolePermissions: true,
        })
      );
    }
  }, [currentUser, uuid]);

  useEffect(() => {
    if (
      data?.user.email &&
      currentUserRolePermissions?.length > 0 &&
      currentUser?.organization_shift
    ) {
      (async () => {
        await update({
          permissions: currentUserRolePermissions,
          organization_shift: currentUser.organization_shift,
        });
        router.refresh();
      })();
    }
  }, [currentUserRolePermissions, currentUser]);

  const handleSwitchOrganization = async (org: any) => {
    try {
      setIsLoadingOrg(true);
      const sessionData = await getSession();

      await dispatch(
        getOrganizationUserDataAction({
          organizationId: org.uuid,
          email: sessionData?.user?.email || "",
        })
      );

      dispatch(setCurrentOrganization(org));
      dispatch(
        listUserAction({
          org_uuid: org.uuid,
          pagination: { page: 1, limit: 10, search: sessionData?.user?.email },
          isCurrentUser: true,
        })
      );
      await update({ org_uuid: org.uuid });
      setIsLoadingOrg(false);
      router.push(`/${org.uuid}/dashboard`);
    } catch (err) {
      console.log(err);
      setIsLoadingOrg(false);
    }
  };

  return (
    <>
      {isLoadingOrg && (
        <div className="fixed inset-0 bg-background-blur backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-sm p-8 flex flex-col items-center gap-4 shadow-xl">
            <LoaderCircle className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold">Switching workspace...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we set up your environment
              </p>
            </div>
          </div>
        </div>
      )}
      <Sidebar>
        <SidebarHeader>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground disabled:opacity-100"
                disabled={organizations.length <= 1}
              >
                <Avatar className="rounded-none">
                  <AvatarImage
                    src={
                      currentOrganization.logo_url ||
                      "https://github.com/shadcn.png"
                    }
                    alt={`Logo of ${currentOrganization.name}`}
                    className="object-cover"
                  />
                  {isOrgUpdating && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center transition-all">
                      <Loader2Icon
                        className="text-white animate-spin"
                        size={20}
                      />
                    </div>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentOrganization?.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {currentOrganization?.domain}
                  </span>
                </div>
                {organizations.length > 1 && (
                  <ChevronsUpDown className="ml-auto size-4" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={"bottom"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="text-md font-bold">
                      Switch organization
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                {organizations
                  .filter((org) => org.uuid !== currentOrganization?.uuid)
                  .map((org) => (
                    <DropdownMenuItem
                      key={org.uuid}
                      onClick={() => handleSwitchOrganization(org)}
                      disabled={isLoadingOrg || !org.is_active}
                    >
                      <Avatar className="rounded-none">
                        <AvatarImage
                          src={org.logo_url || "https://github.com/shadcn.png"}
                          alt={`Logo of ${org.name}`}
                          className="object-cover"
                        />
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm">{org.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {org.domain}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items?.map((item: any) => (
                  <SidebarNestedItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.avatar || "https://github.com/shadcn.png"}
                    alt={user?.name || "User Avatar"}
                  />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.avatar || "https://github.com/shadcn.png"}
                      alt={user?.name || "User Avatar"}
                    />
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  startTransition(async () => {
                    resetTheme();

                    await persistor.purge();
                    await signOutUser();

                    router.replace("/login");
                  });
                }}
              >
                {isPending ? (
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
