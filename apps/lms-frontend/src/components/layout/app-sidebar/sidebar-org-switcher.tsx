"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronsUpDown, Loader2Icon } from "lucide-react";
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
import { persistor, useAppDispatch, useAppSelector } from "@/store";
import { resetStore } from "@/store/reset-store-action";
import { setCurrentOrganization } from "@/features/organizations/organizations.slice";
import WorkspaceModal from "@/shared/workspace-modal";
import { Organization } from "@/features/organizations/organizations.types";

export function SidebarOrgSwitcher() {
  const router = useRouter();
  const { update } = useSession();
  const dispatch = useAppDispatch();

  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

  const { currentOrganization, isOrgUpdating, organizations } = useAppSelector(
    (state) => state.organizationsSlice,
  );

  const handleOrgSelect = async (org: Organization) => {
    try {
      setIsLoadingOrg(true);
      await update({ org_uuid: org.uuid });
      dispatch(setCurrentOrganization(org));
      router.replace(`/${org.uuid}/dashboard`);
    } catch (err) {
      // handle
    } finally {
      setIsLoadingOrg(false);
    }
  };

  return (
    <>
      <WorkspaceModal open={isLoadingOrg} />
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

            <DropdownMenuGroup className="max-h-75 overflow-y-auto">
              {organizations
                .filter((org) => org.uuid !== currentOrganization?.uuid)
                .map((org) => (
                  <DropdownMenuItem
                    key={org.uuid}
                    onClick={() => handleOrgSelect(org)}
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
