"use client";

import * as React from "react";

import { Briefcase, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store";
import DataTable from "@/shared/table";
import { Role } from "@/features/role/role.slice";
import AssignPermission from "@/components/permission/assign-permission";
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
import Title from "@/shared/typography/title";
import { getBadge } from "@/utils/get-badge";
import { updateRolePermissionsAction } from "@/features/permissions/update-role-permissions/update-role-permissions.action";
import { listRolePermissionsAction } from "@/features/permissions/list-role-permissions/list-role-permissions.action";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";
import { listOrganizationPermissionsAction } from "@/features/permissions/list-organization-permissions/list-organization-permissions.action";

export default function ListRoleManagement() {
  const dispatch = useAppDispatch();
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const currentOrgUUID = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const { roles, isLoading } = useAppSelector((state) => state.rolesSlice);

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
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <div>{getBadge("default", row.original.code)}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 300,
      cell: ({ row }) => (
        <div className="whitespace-normal">{row.original.description}</div>
      ),
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
      currentUser?.email,
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
        }),
      );
      setIsUpdating(false);
      await dispatch(
        listRolePermissionsAction({
          org_uuid: currentOrgUUID,
          role_uuid: currentUser.role.uuid,
          isCurrentUserRolePermissions: true,
        }),
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
      listRolePermissionsAction({ org_uuid: currentOrgUUID, role_uuid }),
    );
  };

  const filteredRoles = React.useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const nonAdminRoles = roles.filter((role) => role.name !== "Admin");

    if (!normalizedSearch) return nonAdminRoles;

    return nonAdminRoles.filter((role) => {
      const name = role.name?.toLowerCase() || "";
      const description = role.description?.toLowerCase() || "";
      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [roles, searchQuery]);

  React.useEffect(() => {
    dispatch(
      getOrganizationRolesAction({
        org_uuid: currentOrgUUID,
      }),
    );
    dispatch(listOrganizationPermissionsAction({ org_uuid: currentOrgUUID }));
  }, [currentOrgUUID]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-11/12 min-[1400px]:w-3/4 p-6">
        <Title
          title={{
            text: "Role Management",
            className: "",
          }}
          description={{
            text: "Manage your organization roles and their associated permissions.",
            className: "",
          }}
          className=""
          button={
            hasPermissions(
              "role_management",
              "create",
              currentUserRolePermissions,
              currentUser?.email,
            ) && <CreateRole org_uuid={currentOrgUUID!} />
          }
        />
        {hasPermissions(
          "role_management",
          "read",
          currentUserRolePermissions,
          currentUser?.email,
        ) ? (
          <>
            <DataTable
              data={filteredRoles}
              columns={columns}
              isLoading={isLoading}
              totalCount={filteredRoles.length}
              showPagination={false}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
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
