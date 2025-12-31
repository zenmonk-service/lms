"use client";

import AppBar from "@/components/app-bar";
import * as React from "react";

import { ChevronDown, MoreHorizontal, Pencil, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store";
import { format } from "date-fns";
import DataTable, { PaginationState } from "@/shared/table";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { getOrganizationRolesAction } from "@/features/role/role.action";
import { Role, setPagination } from "@/features/role/role.slice";
import AssignPermission from "@/components/permission/assign-permission";
import { listRolePermissions } from "@/features/permissions/permission.service";
import {
  listOrganizationPermissionsAction,
  listRolePermissionsAction,
  updateRolePermissionsAction,
} from "@/features/permissions/permission.action";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CreateRole from "@/components/role/create-role";
import { hasPermissions } from "@/lib/haspermissios";
import NoReadPermission from "@/shared/no-read-permission";

type Checked = DropdownMenuCheckboxItemProps["checked"];
export default function RoleManagement() {
  const dispatch = useAppDispatch();
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");

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
      header: () => <div className="pl-12">Name</div>,
      cell: ({ row }) => <div className="pl-12">{row.getValue("name")}</div>,
    },

    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.original.description}</div>,
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
              <Button
                onClick={() => {
                  getRolePermissions(row.original.uuid);
                  setSelectedRoleId(row.original.uuid);
                  setAssignDialogOpen(true);
                }}
                variant="default"
                className="justify-start text-white"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Manage Permissions
              </Button>
            ),
          },
        ]
      : []),
  ];

  const handleSave = async (ids: string[]) => {
    const data = await dispatch(
      updateRolePermissionsAction({
        org_uuid: currentOrgUUID,
        role_uuid: selectedRoleId,
        permission_uuids: ids,
      })
    );
    if (currentUser && data.meta.requestStatus === "fulfilled") {
      dispatch(
        listRolePermissionsAction({
          org_uuid: currentOrgUUID,
          role_uuid: currentUser.role.uuid,
          isCurrentUserRolePermissions: true,
        })
      );
    }
    setAssignDialogOpen(false);
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
    <div className="p-6 h-[calc(100vh-77px)] ">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Role Management</h2>
          <p className="text-sm text-muted-foreground">
            List of roles in the organization.
          </p>
        </div>
        {hasPermissions(
          "role_management",
          "create",
          currentUserRolePermissions,
          currentUser?.email
        ) && (
          <div>
            <CreateRole org_uuid={currentOrgUUID!} />
          </div>
        )}
      </div>

      {hasPermissions(
        "role_management",
        "read",
        currentUserRolePermissions,
        currentUser?.email
      ) ? (
        <>
          <DataTable
            data={roles.filter((role) => role.name !== "Admin") || []}
            columns={columns}
            isLoading={isLoading}
            totalCount={total || 0}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            searchPlaceholder="Filter roles..."
            noDataMessage="No roles found."
          />

          <div className="h-[500px] w-0 overflow-hidden">
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogContent className="h-[70%] min-w-[650px]">
                <DialogTitle className="text-lg font-semibold mb-2">
                  Manage Permissions
                </DialogTitle>
                <AssignPermission
                  selectedPermissions={rolePermissions.role_permissions}
                  permissions={permissions}
                  onSave={handleSave}
                  isLoading={isLoadingPermissions}
                />
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        <NoReadPermission />
      )}
    </div>
  );
}
