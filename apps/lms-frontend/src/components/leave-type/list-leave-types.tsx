"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getLeaveTypesAction } from "@/features/leave-types/leave-types.action";
import { LeaveTypes, useLeaveTypesColumns } from "./list-leave-types-columns";
import LeaveTypeForm from "./leave-type-form";
import DataTable from "@/shared/table";
import { hasPermissions } from "@/lib/haspermissios";
import NoPermission from "@/shared/no-permission";

export default function ListLeaveTypes() {
  const dispatch = useAppDispatch();
  const { leaveTypes, isLoading } = useAppSelector(
    (state) => state.leaveTypeSlice,
  );
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );

  const { currentUser } = useAppSelector((state) => state.userSlice);

  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypes | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (leaveType: LeaveTypes) => {
    setSelectedLeaveType(leaveType);
    setEditDialogOpen(true);
  };

  const columns = useLeaveTypesColumns(handleEdit, currentOrganization.uuid);

  // Client-side filtering
  const filteredLeaveTypes = (leaveTypes?.rows || []).filter((lt) =>
    searchTerm.trim() === ""
      ? true
      : lt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lt.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (currentOrganization.uuid) {
      dispatch(
        getLeaveTypesAction({
          org_uuid: currentOrganization.uuid,
        }),
      );
    }
  }, [dispatch, currentOrganization.uuid]);

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
          {selectedLeaveType && (
            <LeaveTypeForm
              label="edit"
              data={{
                name: selectedLeaveType.name,
                code: selectedLeaveType.code,
                description: selectedLeaveType.description,
                applicableRoles: selectedLeaveType.applicable_for.value,
                accrualFrequency: selectedLeaveType.accrual?.period as any,
                is_sandwich_enabled: selectedLeaveType?.is_sandwich_enabled,
                is_clubbing_enabled: selectedLeaveType?.is_clubbing_enabled,
                leaveCount: selectedLeaveType.accrual?.leave_count,
              }}
              leave_type_uuid={selectedLeaveType.uuid}
              isOpen={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              onClose={() => {
                setEditDialogOpen(false);
                setSelectedLeaveType(null);
              }}
            />
          )}
        </div>
      ) : (
        <NoPermission moduleName="Leave Type Management" />
      )}
    </>
  );
}
