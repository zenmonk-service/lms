"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getLeaveTypesAction } from "@/features/leave-types/leave-types.action";
import { useLeaveTypesColumns } from "./list-leave-types-columns";
import DataTable, { PaginationState } from "@/shared/table";
import { hasPermissions } from "@/lib/haspermissios";
import NoPermission from "@/shared/no-permission";

export default function ListLeaveTypes() {
  const dispatch = useAppDispatch();
  const { leaveTypes } = useAppSelector((state) => state.leaveTypeSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    search: "",
  });

  const columns = useLeaveTypesColumns(currentOrganization.uuid);

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    await dispatch(
      getLeaveTypesAction({
        org_uuid: currentOrganization.uuid,
        page: pagination.page,
        limit: pagination.limit,
        search: pagination.search,
      }),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentOrganization.uuid) {
      fetchLeaveTypes();
    }
  }, [currentOrganization, pagination]);

  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  return (
    <>
      {hasPermissions(
        "leave_type_management",
        "read",
        currentUserRolePermissions,
        currentUser?.email,
      ) ? (
        <DataTable
          data={leaveTypes?.rows || []}
          columns={columns}
          isLoading={isLoading}
          totalCount={leaveTypes?.count || 0}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          searchPlaceholder="Search leaves by name or code..."
          noDataMessage="Establish your organization's leave policies to start managing employee time off. Define accrual rules, eligibility roles, and categorization logic."
        />
      ) : (
        <NoPermission moduleName="Leave Type Management" />
      )}
    </>
  );
}
