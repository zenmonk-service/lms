import { Permission } from "@/features/permissions/permission.slice";
import { Role } from "@/features/role/role.type";

type RouteConfig = {
  paths: string[];
  permission: {
    tag: PermissionTag;
    anyOf?: PermissionAction[];
    allOf?: PermissionAction[];
  };
};
export const PERMISSIONS = {
  USER: "user_management",
  ROLE: "role_management",
  ORGANIZATION: "organization_setting_management",
  ATTENDANCE: "attendance_management",
  USER_ATTENDANCE: "user_attendance_management",
  ORGANIZATION_EVENT: "organization_event_management",
  LEAVE_REQUEST: "leave_request_management",
  LEAVE_TYPE: "leave_type_management",
} as const;

export type PermissionTag = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  APPROVE: "approve",
  REPORT: "report",
  CREATE_BULK: "create_bulk",
} as const;

export type PermissionAction = (typeof ACTIONS)[keyof typeof ACTIONS];

export const ROUTES: RouteConfig[] = [
  {
    paths: ["/admin-dashboard/leaves"],
    permission: {
      tag: PERMISSIONS.LEAVE_REQUEST,
      anyOf: [ACTIONS.REPORT, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.APPROVE],
    },
  },
  {
    paths: ["/admin-dashboard/attendance"],
    permission: {
      tag: PERMISSIONS.ATTENDANCE,
      anyOf: [
        ACTIONS.REPORT,
        ACTIONS.READ,
        ACTIONS.UPDATE,
        ACTIONS.CREATE_BULK,
      ],
    },
  },
  {
    paths: ["/user-management"],
    permission: {
      tag: PERMISSIONS.USER,
    },
  },
  {
    paths: ["/details"],
    permission: {
      tag: PERMISSIONS.USER,
      anyOf: [ACTIONS.READ],
    },
  },
  {
    paths: ["/role-management"],
    permission: {
      tag: PERMISSIONS.ROLE,
    },
  },
  {
    paths: [
      "/organization-management",
      "/organization-management/settings",
      "/organization-management/appearance",
    ],
    permission: {
      tag: PERMISSIONS.ORGANIZATION,
    },
  },
  {
    paths: ["/attendance"],
    permission: {
      tag: PERMISSIONS.ATTENDANCE,
    },
  },
  {
    paths: ["/my-attendance"],
    permission: {
      tag: PERMISSIONS.USER_ATTENDANCE,
    },
  },
  {
    paths: ["/organization-event-management"],
    permission: {
      tag: PERMISSIONS.ORGANIZATION_EVENT,
    },
  },
  {
    paths: ["/approvals"],
    permission: {
      tag: PERMISSIONS.LEAVE_REQUEST,
      anyOf: [ACTIONS.APPROVE],
    },
  },
  {
    paths: ["/my-leaves"],
    permission: {
      tag: PERMISSIONS.LEAVE_REQUEST,
      anyOf: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    },
  },
  {
    paths: ["/leave-types"],
    permission: {
      tag: PERMISSIONS.LEAVE_TYPE,
      anyOf: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    },
  },
];
export const hasPermission = (
  role: Role & { role_permissions: Permission[] },
  tag: PermissionTag,
  options?: {
    anyOf?: PermissionAction[];

    allOf?: PermissionAction[];
  },
): boolean => {
  const permissions =
    role.role_permissions?.filter((permission) => permission.tag === tag) ?? [];

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
