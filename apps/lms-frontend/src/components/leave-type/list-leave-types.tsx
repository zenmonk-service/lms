"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useLeaveTypesColumns } from "./list-leave-types-columns";
import DataTable from "@/shared/table";
import { hasPermissions } from "@/lib/haspermissios";
import NoPermission from "@/shared/no-permission";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";

export default function ListLeaveTypes() {
  const dispatch = useAppDispatch();
  const { leaveTypes } = useAppSelector((state) => state.leaveSlice);
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = useLeaveTypesColumns(currentOrganization.uuid);

  // Client-side filtering
  const filteredLeaveTypes = (leaveTypes?.rows || []).filter((lt) =>
    searchTerm.trim() === ""
      ? true
      : lt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lt.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    await dispatch(listLeaveTypesAction({ org_uuid: currentOrganization.uuid }));
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentOrganization.uuid) {
      fetchLeaveTypes();
    }
  }, [currentOrganization.uuid]);

  return (
    <>
      {hasPermissions(
        "leave_type_management",
        "read",
        currentUserRolePermissions,
        currentUser?.email,
      ) ? (
        <div>
          <DataTable
            data={filteredLeaveTypes}
            columns={columns}
            isLoading={isLoading}
            totalCount={filteredLeaveTypes.length}
            showPagination={false}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search leaves by name or code..."
            noDataMessage="Establish your organization's leave policies to start managing employee time off. Define accrual rules, eligibility roles, and categorization logic."
          />
        </div>
      ) : (
        <NoPermission moduleName="Leave Type Management" />
      )}
    </>
  );
}
