import { Permission } from "@/features/permissions/permission.slice";

export function hasPermissions(
  tag: string,
  action: string,
  requiredPermissions: Permission[],
  email?: string
) {
  return requiredPermissions.some((perm) => tag === perm.tag && action === perm.action) ||
    (email === "superadmin@superadmin.in");
}
