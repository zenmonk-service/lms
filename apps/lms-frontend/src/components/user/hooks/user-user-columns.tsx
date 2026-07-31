"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserInterface } from "@/features/user/user.slice";
import { hasPermissions } from "@/lib/has-permission";
import { activateUserAction } from "@/features/user/activate-user/activate-user.action";
import { deactivateUserAction } from "@/features/user/deactivate-user/deactivate-user.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/shared/user-avatar";
import { StatusToggle } from "@/shared/status-toggle";

export function useUserColumns() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentUser, pagination } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);
  const { isLoading: isActiveLoading, currentOrganization } = useAppSelector((state) => state.organizationsSlice);

  const canActivate = hasPermissions(
    "user_management",
    "activate",
    currentUserRolePermissions,
    currentUser?.email,
  );
  const canRead = hasPermissions(
    "user_management",
    "read",
    currentUserRolePermissions,
    currentUser?.email,
  );

  const statusColumn: ColumnDef<UserInterface> = {
    id: "active_inactive",
    header: () => (
      <div className="text-center">
        <span>Status</span>
      </div>
    ),
    cell: ({ row }) => (
      <StatusToggle
        active={row.original.is_active}
        onActive={async () => {
          await dispatch(
            activateUserAction({
              org_uuid: currentOrganization.uuid,
              user_uuid: row.original.user_id,
            }),
          );
        }}
        onInactive={async () => {
          await dispatch(
            deactivateUserAction({
              org_uuid: currentOrganization.uuid,
              user_uuid: row.original.user_id,
            }),
          );
        }}
      />
    ),
  };

  return useMemo<ColumnDef<UserInterface>[]>(
    () => [
      ...(canActivate ? [statusColumn] : []),
      {
        accessorKey: "member",
        header: "Member",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <UserAvatar
              user={{
                name: user.name,
                email: user.email,
                image: user.image || undefined,
              }}
            />
          );
        },
      },
      {
        id: "employee_code",
        header: () => (
          <div className="text-center">
            <span>Employee code</span>
          </div>
        ),
        cell: ({ row }) => {
          const emp_code = row.original.emp_code;
          return (
            <div className="flex justify-center">
              <Badge variant="outline" className="rounded-sm">
                {emp_code || "N/A"}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="secondary" className="rounded-sm">
            {row.original.role.name}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Joined date",
        cell: ({ row }) => {
          const dateStr = row.getValue("created_at") as string;
          const date = new Date(dateStr);
          return (
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <p className="text-sm">{date.toLocaleDateString()}</p>
            </div>
          );
        },
      },

      ...(canRead
        ? [
            {
              id: "actions",
              cell: ({ row }: any) => {
                const userUuid = row.original.user_id;
                return (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        router.push(
                          `/${currentOrganization.uuid}/user-management/${userUuid}/details`,
                        )
                      }
                    >
                      <ChevronRight size={16} strokeWidth={5} />
                    </Button>
                  </div>
                );
              },
            },
          ]
        : []),
    ],
    [
      canActivate,
      canRead,
      isActiveLoading,
      currentOrganization.uuid,
      pagination,
      dispatch,
      router,
    ],
  );
}
