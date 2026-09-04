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
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react";
import { useAppSelector } from "@/store";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";

export function useSidebarItems(uuid: string) {
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );
  const can = usePermissionCheck();
  const canApprove = can(
    PermissionTag.LEAVE_REQUEST_MANAGEMENT,
    PermissionAction.APPROVE,
  );

  const canReadAttendance = can(
    PermissionTag.ATTENDANCE_REPORT_MANAGEMENT,
    PermissionAction.READ,
  );

    const canSeeLeaveTypes = can(
    PermissionTag.LEAVE_TYPE_MANAGEMENT,
    PermissionAction.READ,
  );

  const canSeeLeaveReport = can(
    PermissionTag.LEAVE_REPORT_MANAGEMENT,
    PermissionAction.READ,
  );

   const adminPayroll = can(
     PermissionTag.PAYROLL_MANAGEMENT,
     PermissionAction.REPORT,
    );
  const canSeeLeaveRequests = can(
    PermissionTag.LEAVE_REQUEST_MANAGEMENT,
    PermissionAction.READ,
  );

  function hasPagePermission(tag: string) {
    return currentUserRolePermissions?.some((perm) => perm.tag === tag);
  }

  function filterItemsByPermission(items: any[]): any[] {
    return items
      .filter((item) => {
        if (!item.tag) return true;
        if (item.title === "Approvals") {
          return hasPagePermission(item.tag) && canApprove;
        }
        if (item.name === "Admin Attendance") {
          return hasPagePermission(item.tag) && canReadAttendance;
        }
        if (item.name === "Admin Leave") {
          return hasPagePermission(item.tag) && canSeeLeaveReport;
        }
        if (item.name === "My Attendance") {
          return hasPagePermission(item.tag) || canReadAttendance;
        }
        if (item.name === "Admin Payroll") {
          return hasPagePermission(item.tag) &&  adminPayroll;
        }
        if (item.title === "Leave Types") {
          return hasPagePermission(item.tag) && canSeeLeaveTypes;
        }
         if (item.title === "My Leaves") {
          return hasPagePermission(item.tag) && canSeeLeaveRequests;
        }
        if (item.title === "Leave Types") {
          return hasPagePermission(item.tag) && canSeeLeaveTypes;
        }
         if (item.title === "My Leaves") {
          return hasPagePermission(item.tag) && canSeeLeaveRequests;
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
      icon: LayoutDashboard,
    },
    {
      title: "Admin Dashboard",
      icon: LayoutDashboard,
      items: [
        {
          tag: PermissionTag.ATTENDANCE_REPORT_MANAGEMENT,
          title: "Attendance",
          name: "Admin Attendance",
          url: `/${uuid}/admin-dashboard/attendance`,
          icon: CalendarCheck,
        },
        {
          tag: PermissionTag.LEAVE_REPORT_MANAGEMENT,
          title: "Leave",
          name: "Admin Leave",
          url: `/${uuid}/admin-dashboard/leaves`,
          icon: CalendarDays,
        },
        {
          tag: PermissionTag.PAYROLL_MANAGEMENT,
          name: "Admin Payroll",
          title: "Payroll",
          url: `/${uuid}/admin-dashboard/payroll`,
          icon: ClipboardList,
        },
      ],
    },
    {
      tag: PermissionTag.ORGANIZATION_SETTING_MANAGEMENT,
      title: "Organization Management",
      icon: Building2,
      items: [
        {
          tag: PermissionTag.ORGANIZATION_SETTING_MANAGEMENT,
          title: "Default Settings",
          url: `/${uuid}/organization-management/settings`,
          icon: Settings,
        },
        {
          tag: PermissionTag.ORGANIZATION_SETTING_MANAGEMENT,
          title: "Appearance",
          url: `/${uuid}/organization-management/appearance`,
          icon: Palette,
        },
        {
          title: "Roles",
          icon: Users,
          dynamic: "roles",
        },
      ],
    },
    {
      tag: PermissionTag.USER_MANAGEMENT,
      title: "User Management",
      url: `/${uuid}/user-management`,
      icon: Users,
    },
    {
      tag: PermissionTag.ROLE_MANAGEMENT,
      title: "Role Management",
      url: `/${uuid}/role-management`,
      icon: Users,
    },
    {
      tag: PermissionTag.ORGANIZATION_EVENT_MANAGEMENT,
      title: "Event Management",
      url: `/${uuid}/organization-event-management`,
      icon: Calendar,
    },
    {
      title: "Leave Management",
      icon: Calendar,
      items: [
        {
          tag: PermissionTag.LEAVE_TYPE_MANAGEMENT,
          title: "Leave Types",
          url: `/${uuid}/leave-types`,
          icon: ClipboardList,
        },
        {
          tag: PermissionTag.LEAVE_REQUEST_MANAGEMENT,
          title: "My Leaves",
          url: `/${uuid}/my-leaves`,
          icon: Plane,
        },
        {
          tag: PermissionTag.LEAVE_REQUEST_MANAGEMENT,
          title: "Approvals",
          url: `/${uuid}/approvals`,
          icon: BookCheck,
        },
      ],
    },
    {
      tag: PermissionTag.USER_ATTENDANCE_MANAGEMENT,
      title: canReadAttendance ? "Attendance" : "My Attendance",
      name: "My Attendance",
      url: `/${uuid}/attendance`,
      icon: Plane,
    },
  ];

  return filterItemsByPermission(allItems);
}
