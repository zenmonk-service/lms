"use client";

import * as React from "react";

import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store";
import { listUserAction } from "@/features/user/user.action";
import { setPagination, UserInterface } from "@/features/user/user.slice";
import { format } from "date-fns";
import CreateUser from "@/components/user/create-user";
import DataTable, { PaginationState } from "@/shared/table";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Switch } from "../ui/switch";
import {
  activateUserAction,
  deactivateUserAction,
} from "@/features/organizations/organizations.action";

import { hasPermissions } from "@/libs/haspermissios";
import NoReadPermission from "@/shared/no-read-permission";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
type Checked = DropdownMenuCheckboxItemProps["checked"];

export default function ManageOrganizationsUser({
  organization_uuid,
}: {
  organization_uuid?: string | undefined;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice
  );

  const { users, isLoading, total, pagination, currentUser } = useAppSelector(
    (state) => state.userSlice
  );

  const { isLoading: isActiveLoading, currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice
  );






  const columns: ColumnDef<UserInterface>[] = [
    ...(hasPermissions(
      "user_management",
      "activate",
      currentUserRolePermissions,
      currentUser?.email
    )
      ? [
          {
            id: "active_inactive",
            header: () => {
              return (
                <div className="text-center">
                  <span>Status</span>
                </div>
              );
            },
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
                          className="data-[state=checked]:bg-orange-500"
                          onClick={async () => {
                            if (isActive) {
                              await dispatch(
                                deactivateUserAction({
                                  org_uuid: currentOrganization.uuid,
                                  user_uuid: user_uuid,
                                })
                              );
                            } else {
                              await dispatch(
                                activateUserAction({
                                  org_uuid: currentOrganization.uuid,
                                  user_uuid: user_uuid,
                                })
                              );
                            }
                            await dispatch(
                              listUserAction({
                                org_uuid: currentOrganization.uuid,
                                pagination,
                              })
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
        accessorKey: "image",
        header: () => <div className="pl-12">Image</div>,
        cell: ({ row }) => {
          const user = row.original;
          const initials = user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          
          return (
            <div className="pl-12">
              <Avatar className="h-10 w-10 border-2 border-orange-100">
                <AvatarImage 
                  src={user.image || ""} 
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          );
        },
      },
    {
      accessorKey: "name",

      header: () => <div className="pl-12">Name</div>,
      cell: ({ row }) => <div className="pl-12">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <div>{row.original.role.name}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const value = row.getValue("created_at");
        const date = value
          ? format(new Date(value as string), "dd-MM-yyyy")
          : "";
        return <div>{date}</div>;
      },
    },
    ...(hasPermissions(
      "user_management",
      "update",
      currentUserRolePermissions,
      currentUser?.email
    )
      ? [
          {
            id: "actions",
            header: "Actions",
            enableHiding: true,
            size: 150,
            cell: ({ row }: any) => (
              <CreateUser
                org_uuid={currentOrganization.uuid}
                isEdited={true}
                userData={row.original}
              />
            ),
          },
        ]
      : []),


      
  ];

  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    dispatch(setPagination({ ...pagination, ...newPagination }));
  };

  React.useEffect(() => {
    if (
      organization_uuid !== currentOrganization.uuid &&
      organization_uuid &&
      currentOrganization.uuid
    ) {
      router.push("/organizations");
    }
    if (currentOrganization.uuid) {
      dispatch(
        listUserAction({
          org_uuid: currentOrganization.uuid,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            search: pagination.search?.trim(),
          },
        })
      );
    }
  }, [currentOrganization.uuid, pagination]);

  return (
    <div className="p-6 h-[calc(100vh-77px)] box-border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            List of users in the organization.
          </p>
        </div>
        {hasPermissions(
          "user_management",
          "create",
          currentUserRolePermissions,
          currentUser?.email
        ) && (
          <div>
            <CreateUser org_uuid={currentOrganization.uuid} isEdited={false} />
          </div>
        )}
      </div>
      {hasPermissions(
        "user_management",
        "read",
        currentUserRolePermissions,
        currentUser?.email
      ) ? (
        <DataTable
          data={users || []}
          columns={columns}
          isLoading={isLoading}
          totalCount={total || 0}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          searchPlaceholder="Filter users..."
          noDataMessage="No users found."
        />
      ) : (
        <NoReadPermission />
      )}
    </div>
  );
}
