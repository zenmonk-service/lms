"use client";
import {
  Home,
  Users,
  Calendar,
  ClipboardList,
  Plane,
  BookCheck,
  Building2,
  Settings,
  Palette,
} from "lucide-react";
import { useAppSelector } from "@/store";
import { hasPermissions } from "@/lib/haspermissios";

export function useSidebarItems(uuid: string) {
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );

  function hasPagePermission(tag: string) {
    return currentUserRolePermissions?.some((perm) => perm.tag === tag);
  }

  function filterItemsByPermission(items: any[]): any[] {
    return items
      .filter((item) => {
        if (!item.tag) return true;
        if (item.title === "Approvals") {
          return (
            hasPagePermission(item.tag) &&
            hasPermissions(
              "leave_request_management",
              "approve",
              currentUserRolePermissions,
              currentUser?.email,
            )
          );
        }
        return hasPagePermission(item.tag);
      })
      .map((item) => {
        if (item.items) {
          const filteredChildren = filterItemsByPermission(item.items);
          return filteredChildren.length > 0
            ? { ...item, items: filteredChildren }
            : null;
        }
        return item;
      })
      .filter(Boolean);
  }

  const allItems = [
    {
      title: "Dashboard",
      url: `/${uuid}/dashboard`,
      icon: Home,
    },
    {
      title: "Admin Dashboard",
      url: `/${uuid}/admin-dashboard`,
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
      tag: "organization_management",
      title: "Organization Management",
      icon: Building2,
      items: [
        {
          tag: "organization_management",
          title: "Settings",
          url: `/${uuid}/organization-management/settings`,
          icon: Settings,
        },
        {
          tag: "organization_management",
          title: "Appearance",
          url: `/${uuid}/organization-management/appearance`,
          icon: Palette,
        },
      ],
    },
    {
      tag: "organization_event_management",
      title: "Event Management",
      url: `/${uuid}/organization-event-management`,
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
          tag: "user_attendance_management",
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
  ];

  return filterItemsByPermission(allItems);
}
