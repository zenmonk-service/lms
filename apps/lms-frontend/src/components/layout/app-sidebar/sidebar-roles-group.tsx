"use client";
import Link from "next/link";
import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { ChevronDown, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";

export function SidebarRolesGroup() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { organization_uuid } = useParams<{ organization_uuid: string }>();
  const { roles, isLoading } = useAppSelector((state) => state.rolesSlice);
  const [open, setOpen] = useState(false);

  const basePath = `/${organization_uuid}/organization-management/roles`;
  const active = pathname.startsWith(basePath);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && organization_uuid) {
      dispatch(getOrganizationRolesAction({ org_uuid: organization_uuid }));
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={active} onClick={handleToggle}>
        <div className="flex items-center gap-3 w-full">
          <Users className="w-4 h-4 shrink-0" />
          <span className="text-sm flex-1 tracking-tight">Roles</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </SidebarMenuButton>

      <div
        className={`grid w-full transition-[grid-template-rows] duration-300 ease-in-out mt-1 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <SidebarMenu className="pl-4 w-full max-h-64 overflow-y-auto">
            {isLoading && roles.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-2 py-1.5">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))
              : roles.map((role) => (
                  <SidebarMenuButton
                    key={role.uuid}
                    asChild
                    className="w-full"
                    isActive={pathname === `${basePath}/${role.uuid}`}
                  >
                    <Link href={`${basePath}/${role.uuid}`}>
                      <span className="truncate">{role.name}</span>
                    </Link>
                  </SidebarMenuButton>
                ))}
          </SidebarMenu>
        </div>
      </div>
    </SidebarMenuItem>
  );
}