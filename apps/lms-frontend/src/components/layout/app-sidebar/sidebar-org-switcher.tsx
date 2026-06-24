"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronsUpDown, Loader2Icon, LoaderCircle } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarHeader, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginOrganizationAction } from "@/features/organizations/login-organization/login-organization.action";
import { setCurrentOrganization } from "@/features/organizations/organizations.slice";
import { setCurrentUser, UserInterface } from "@/features/user/user.slice";

interface SidebarOrgSwitcherProps {
  uuid: string;
}

export function SidebarOrgSwitcher({ uuid }: SidebarOrgSwitcherProps) {
  const router = useRouter();
  const { update } = useSession();
  const dispatch = useAppDispatch();

  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

  const { currentOrganization, isOrgUpdating, organizations } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);

  const handleSwitchOrganization = async (org: any) => {
    try {
      setIsLoadingOrg(true);

      const userDataResponse = await dispatch(
        loginOrganizationAction({
          org_uuid: org.uuid,
          email: currentUser.email,
        }),
      ).unwrap();

      const normalizedCurrentUser: UserInterface = {
        user_id:
          userDataResponse?.user_id ||
          userDataResponse?.uuid ||
          String(userDataResponse?.id || ""),
        name: userDataResponse?.name || "",
        email: userDataResponse?.email || "",
        role: {
          id: String(userDataResponse?.role?.id || ""),
          uuid: userDataResponse?.role?.uuid || "",
          name: userDataResponse?.role?.name || "",
          description: userDataResponse?.role?.description || "",
        },
        organization_shift: {
          uuid: userDataResponse?.organization_shift?.uuid || "",
          name: userDataResponse?.organization_shift?.name || "",
          start_time: userDataResponse?.organization_shift?.start_time || "",
          end_time: userDataResponse?.organization_shift?.end_time || "",
          effective_hours:
            userDataResponse?.organization_shift?.effective_hours || 0,
        },
        is_active: Boolean(userDataResponse?.is_active),
        created_at: userDataResponse?.created_at || "",
        image: userDataResponse?.image || "",
        documents: userDataResponse?.documents || [],
      };

      dispatch(setCurrentOrganization(org));
      dispatch(setCurrentUser(normalizedCurrentUser));

      await update({
        org_uuid: org.uuid,
        name: normalizedCurrentUser.name,
        email: normalizedCurrentUser.email,
        image: normalizedCurrentUser.image || null,
        role: normalizedCurrentUser.role,
        organization_shift: normalizedCurrentUser.organization_shift,
      });

      router.push(`/${org.uuid}/dashboard`);
    } catch (err) {
      console.log(err);
    } finally {
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
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-md font-bold">Switch organization</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

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
    </>
  );
}
