"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPagination } from "@/features/user/user.slice";
import { hasPermissions } from "@/lib/has-permission";
import DataTable, { PaginationState } from "@/shared/table";
import NoPermission from "@/shared/no-permission";
import Title from "@/shared/typography/title";
import CreateUser from "../create-user";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { useUserColumns } from "../hooks/user-user-columns";

export default function ManageOrganizationsUser({
  organization_uuid,
}: Readonly<{
  organization_uuid?: string;
}>) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);
  const { 
    users, 
    isLoading, 
    total, 
    pagination,
    currentUser
  } = useAppSelector((state) => state.userSlice);

  const columns = useUserColumns();

  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    dispatch(setPagination({ ...pagination, ...newPagination }));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setPagination({ ...pagination, search: value, page: 1 }));
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
        }),
      );
    }
  }, [currentOrganization.uuid, pagination]);

  React.useEffect(() => {
    return () => {
      dispatch(setPagination({ page: 1, limit: 10, search: "" }));
    };
  }, []);

  return (
    <>
      <Title
        title={{ text: "User Management" }}
        description={{ text: "Manage your organization users and their associated permissions." }}
      />

      {hasPermissions(
        "user_management",
        "read",
        currentUserRolePermissions,
        currentUser?.email,
      ) ? (
        <DataTable
          data={users || []}
          columns={columns}
          isLoading={isLoading}
          totalCount={total || 0}
          pagination={{ page: pagination.page, limit: pagination.limit }}
          searchValue={pagination.search}
          onSearchChange={handleSearchChange}
          maxHeight="calc(100vh - 367px)"
          onPaginationChange={handlePaginationChange}
          searchPlaceholder="Search users by name or email..."
          noDataMessage="Establish your organization's user base to start managing roles and permissions effectively."
        >
          {hasPermissions(
            "user_management",
            "create",
            currentUserRolePermissions,
            currentUser?.email,
          ) && (
            <CreateUser org_uuid={currentOrganization.uuid}  />
          )}
        </DataTable>
      ) : (
        <NoPermission moduleName="User Management" />
      )}
    </>
  );
}
