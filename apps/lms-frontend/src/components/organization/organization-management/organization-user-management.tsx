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
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Switch } from "../../ui/switch";
import {
  activateUserAction,
  deactivateUserAction,
} from "@/features/organizations/organizations.action";

import { hasPermissions } from "@/lib/haspermissios";
import NoReadPermission from "@/shared/no-read-permission";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Badge } from "../../ui/badge";
import { Mail, Calendar, Shield, User as UserIcon } from "lucide-react";
type Checked = DropdownMenuCheckboxItemProps["checked"];

export default function ManageOrganizationsUser({
  organization_uuid,
}: {
  organization_uuid?: string | undefined;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedUser, setSelectedUser] = React.useState<UserInterface | null>(
    null
  );
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

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
            <Avatar
              className="h-10 w-10 border-2 border-orange-100 cursor-pointer hover:border-orange-300 transition-all hover:scale-110"
              onClick={() => {
                setSelectedUser(user);
                setIsProfileOpen(true);
              }}
            >
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
    <>
      <div className="p-6 w-full h-full flex flex-col gap-6">
        <div className="flex items-center justify-between mb-4 shrink-0">
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
              <CreateUser
                org_uuid={currentOrganization.uuid}
                isEdited={false}
              />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
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
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              User Profile
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b border-border">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage
                    src={selectedUser.image || ""}
                    alt={selectedUser.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {selectedUser.name}
                  </h3>
                  <Badge
                    variant={selectedUser.is_active ? "default" : "secondary"}
                  >
                    {selectedUser.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium text-foreground">
                      {selectedUser.role.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium text-foreground">
                      {format(
                        new Date(selectedUser.created_at),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
