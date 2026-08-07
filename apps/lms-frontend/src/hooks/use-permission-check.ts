import { useCallback } from "react";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";
import { useAppSelector } from "@/store";

const SUPER_ADMIN_EMAIL = "superadmin@superadmin.in";

export function usePermissionCheck() {
  const email = useAppSelector((state) => state.userSlice.currentUser?.email);
  const requiredPermissions = useAppSelector((state) => state.permissionSlice.currentUserRolePermissions);

  return useCallback(
    (tag: PermissionTag, action: PermissionAction) => {
      return (
        requiredPermissions.some(
            (perm) => tag === perm.tag && action === perm.action) || email === SUPER_ADMIN_EMAIL
      );
    },
    [requiredPermissions, email],
  );
}
