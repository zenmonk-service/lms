import { Permission } from "@/features/permissions/permission.slice";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import { Role } from "@/features/role/role.type";

type RouteConfig = {
  paths: string[];
  permission: {
    tag: PermissionTag[];
    anyOf?: PermissionAction[];
    allOf?: PermissionAction[];
  };
};
export const ROUTES: RouteConfig[] = [
  {
    paths: ["/admin-dashboard/leaves"],
    permission: {
      tag: [PermissionTag.LEAVE_REQUEST_MANAGEMENT],
      anyOf: [
        PermissionAction.REPORT,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.APPROVE,
      ],
    },
  },
  {
    paths: ["/admin-dashboard/attendance"],
    permission: {
      tag: [PermissionTag.ATTENDANCE_MANAGEMENT],
      allOf: [PermissionAction.REPORT],
    },
  },
  {
    paths: ["/user-management"],
    permission: {
      tag: [PermissionTag.USER_MANAGEMENT],
    },
  },
  {
    paths: ["/details"],
    permission: {
      tag: [PermissionTag.USER_MANAGEMENT],
      anyOf: [PermissionAction.READ],
    },
  },
  {
    paths: ["/role-management"],
    permission: {
      tag: [PermissionTag.ROLE_MANAGEMENT],
    },
  },
  {
    paths: [
      "/organization-management",
      "/organization-management/settings",
      "/organization-management/appearance",
    ],
    permission: {
      tag: [PermissionTag.ORGANIZATION_SETTING_MANAGEMENT],
    },
  },
  {
    paths: ["/attendance"],
    permission: {
      tag: [
        PermissionTag.USER_ATTENDANCE_MANAGEMENT,
        PermissionTag.ATTENDANCE_MANAGEMENT,
      ],
      anyOf: [PermissionAction.READ, PermissionAction.REPORT],
    },
  },
  {
    paths: ["/organization-event-management"],
    permission: {
      tag: [PermissionTag.ORGANIZATION_EVENT_MANAGEMENT],
    },
  },
  {
    paths: ["/approvals"],
    permission: {
      tag: [PermissionTag.LEAVE_REQUEST_MANAGEMENT],
      anyOf: [PermissionAction.APPROVE],
    },
  },
  {
    paths: ["/my-leaves"],
    permission: {
      tag: [PermissionTag.LEAVE_REQUEST_MANAGEMENT],
      anyOf: [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
      ],
    },
  },
  {
    paths: ["/leave-types"],
    permission: {
      tag: [PermissionTag.LEAVE_TYPE_MANAGEMENT],
      anyOf: [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
      ],
    },
  },
];
export const hasPermission = (
  role: Role & { role_permissions: Permission[] },
  tag: PermissionTag[],
  options?: {
    anyOf?: PermissionAction[];
    allOf?: PermissionAction[];
  },
): boolean => {
  const permissions =
    role.role_permissions?.filter((permission) =>
      tag.includes(permission.tag),
    ) ?? [];

  if (!permissions.length) {
    return false;
  }
  // Only tag is required
  if (!options) {
    return true;
  }

  // At least one action must exist
  if (options?.anyOf) {
    return permissions.some((permission) =>
      options?.anyOf?.includes(permission.action as PermissionAction),
    );
  }

  // Every action must exist
  if (options?.allOf) {
    return options?.allOf?.every((action) =>
      permissions.some((permission) => permission.action === action),
    );
  }

  return true;
};
