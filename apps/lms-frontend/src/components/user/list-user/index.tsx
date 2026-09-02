"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPagination } from "@/features/user/user.slice";
import DataTable, { PaginationState } from "@/shared/table";
import Title from "@/shared/typography/title";
import CreateUser from "../create-user";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { useUserColumns } from "../hooks/user-user-columns";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";

interface IProps {
  organization_uuid?: string;
}

export default function ManageOrganizationsUser({ organization_uuid }: IProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const { users, isLoading, total, pagination } = useAppSelector(
    (state) => state.userSlice,
  );

  const can = usePermissionCheck();
  const canReadUser = can(PermissionTag.USER_MANAGEMENT, PermissionAction.READ);
  const canCreateUser = can(
    PermissionTag.USER_MANAGEMENT,
    PermissionAction.CREATE,
  );

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

    if (currentOrganization.uuid && canReadUser) {
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
  }, [currentOrganization.uuid, pagination, canReadUser]);

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

      <DataTable
        data={users || []}
        hasPermission={canReadUser}
        moduleName="User Management"
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
        {canCreateUser && <CreateUser org_uuid={currentOrganization.uuid} />}
      </DataTable>
    </>
  );
}
