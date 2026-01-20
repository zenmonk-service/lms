"use client";

import * as React from "react";

import { Briefcase, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store";
import DataTable, { PaginationState } from "@/shared/table";
import { getOrganizationRolesAction } from "@/features/role/role.action";
import { Role, setPagination } from "@/features/role/role.slice";
import AssignPermission from "@/components/permission/assign-permission";
import {
  listOrganizationPermissionsAction,
  listRolePermissionsAction,
  updateRolePermissionsAction,
} from "@/features/permissions/permission.action";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CreateRole from "@/components/role/create-role";
import { hasPermissions } from "@/lib/haspermissios";
import { toastError } from "@/shared/toast/toast-error";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NoPermission from "@/shared/no-permission";

export default function RoleManagement() {
  const dispatch = useAppDispatch();
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);

  const currentOrgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid
  );
  const { roles, isLoading, total, pagination } = useAppSelector(
    (state) => state.rolesSlice
  );

  const { currentUser } = useAppSelector((state) => state.userSlice);

  const {
    rolePermissions,
    permissions,
    currentUserRolePermissions,
    isLoading: isLoadingPermissions,
  } = useAppSelector((state) => state.permissionSlice);

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: () => <div className="pl-10">Name</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="bg-muted p-2 rounded-md">
            <Briefcase className="h-4 w-4" />
          </div>
          <p>{row.getValue("name")}</p>
        </div>
      ),
    },

    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.original.description}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const dateStr = row.getValue("created_at") as string;
        const date = new Date(dateStr);
        return (
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <p className="text-xs">{date.toLocaleDateString()}</p>
          </div>
        );
      },
    },

    ...(hasPermissions(
      "role_management",
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"icon-sm"}
                    onClick={() => {
                      getRolePermissions(row.original.uuid);
                      setSelectedRoleId(row.original.uuid);
                      setAssignDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Manage permission</TooltipContent>
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  const handleSave = async (ids: string[]) => {
    try {
      setIsUpdating(true);
      await dispatch(
        updateRolePermissionsAction({
          org_uuid: currentOrgUUID,
          role_uuid: selectedRoleId,
          permission_uuids: ids,
        })
      );
      setIsUpdating(false);
      await dispatch(
        listRolePermissionsAction({
          org_uuid: currentOrgUUID,
          role_uuid: currentUser.role.uuid,
          isCurrentUserRolePermissions: true,
        })
      );
      setAssignDialogOpen(false);
    } catch (error) {
      toastError("Failed to update role permissions. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRolePermissions = async (role_uuid: string) => {
    dispatch(
      listRolePermissionsAction({ org_uuid: currentOrgUUID, role_uuid })
    );
  };
  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    dispatch(setPagination({ ...pagination, ...newPagination }));
  };

  React.useEffect(() => {
    dispatch(
      getOrganizationRolesAction({
        org_uuid: currentOrgUUID,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          search: pagination.search?.trim(),
        },
      })
    );
    dispatch(listOrganizationPermissionsAction({ org_uuid: currentOrgUUID }));
  }, [currentOrgUUID, pagination]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-11/12 min-[1400px]:w-3/4 p-6">
        <div className="mb-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">Role Management</h2>
            {hasPermissions(
              "role_management",
              "create",
              currentUserRolePermissions,
              currentUser?.email,
            ) && <CreateRole org_uuid={currentOrgUUID!} />}
          </div>
          <p className="text-sm text-muted-foreground">
            Manage roles and their associated permissions within the
            organization.
          </p>
        </div>
        {hasPermissions(
          "role_management",
          "read",
          currentUserRolePermissions,
          currentUser?.email,
        ) ? (
          <>
            <DataTable
              data={roles.filter((role) => role.name !== "Admin") || []}
              columns={columns}
              isLoading={isLoading}
              totalCount={total || 0}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              searchPlaceholder="Search roles by name or description..."
              noDataMessage="Create roles to define access levels and permissions for users within the organization."
            />
            <div className="w-0 overflow-hidden">
              <Dialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
              >
                <DialogContent className="min-w-162.5">
                  <DialogTitle className="text-lg font-semibold">
                    Manage Permissions
                  </DialogTitle>
                  <AssignPermission
                    selectedPermissions={rolePermissions.role_permissions}
                    permissions={permissions}
                    onSave={handleSave}
                    handleCancel={() => setAssignDialogOpen(false)}
                    isLoading={isLoadingPermissions}
                    isUpdating={isUpdating}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : (
          <NoPermission moduleName="Role Management" />
        )}
      </div>
    </div>
  );
}
