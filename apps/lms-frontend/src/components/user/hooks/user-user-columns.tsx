"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, ChevronRight, Mail } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store";
import { UserInterface } from "@/features/user/user.slice";
import { hasPermissions } from "@/lib/haspermissios";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { activateUserAction } from "@/features/user/activate-user/activate-user.action";
import { deactivateUserAction } from "@/features/user/deactivate-user/deactivate-user.action";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UseUserColumnsParams {
  onSelectUser: (user: UserInterface) => void;
}

export function useUserColumns({ onSelectUser }: UseUserColumnsParams) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);
  const { currentUser, pagination } = useAppSelector((state) => state.userSlice);
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

  return useMemo<ColumnDef<UserInterface>[]>(
    () => [
      ...(canActivate
        ? [
            {
              id: "active_inactive",
              header: () => (
                <div className="text-center">
                  <span>Status</span>
                </div>
              ),
              cell: ({ row }: any) => {
                const isActive = row.original.is_active;
                const user_uuid = row.original.user_id;
                return (
                  <div className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Switch
                            checked={isActive}
                            disabled={isActiveLoading}
                            onClick={async () => {
                              if (isActive) {
                                await dispatch(
                                  deactivateUserAction({
                                    org_uuid: currentOrganization.uuid,
                                    user_uuid,
                                  }),
                                );
                              } else {
                                await dispatch(
                                  activateUserAction({
                                    org_uuid: currentOrganization.uuid,
                                    user_uuid,
                                  }),
                                );
                              }

                              await dispatch(
                                listUserAction({
                                  org_uuid: currentOrganization.uuid,
                                  pagination,
                                }),
                              );
                            }}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isActive ? "Active" : "Inactive"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              },
            },
          ]
        : []),

      {
        accessorKey: "member",
        header: "Member",
        cell: ({ row }) => {
          const user = row.original;
          const initials = user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div className="flex gap-2">
              <Avatar className="rounded-full" onClick={() => onSelectUser(user)}>
                <AvatarImage
                  src={user.image || ""}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p>{user.name}</p>
                <div className="flex items-center gap-1">
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
              </div>
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
              <p className="text-sm font-medium">{date.toLocaleDateString()}</p>
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
      onSelectUser,
    ],
  );
}