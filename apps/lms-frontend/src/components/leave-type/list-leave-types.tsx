"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getLeaveTypesAction } from "@/features/leave-types/leave-types.action";
import { LeaveTypes, useLeaveTypesColumns } from "./list-leave-types-columns";
import LeaveTypeForm from "./leave-type-form";
import DataTable, { PaginationState } from "@/shared/table";
import { hasPermissions } from "@/libs/haspermissios";
import NoReadPermission from "@/shared/no-read-permission";
import { current } from "@reduxjs/toolkit";

export default function ListLeaveTypes() {
  const dispatch = useAppDispatch();
  const { leaveTypes, isLoading } = useAppSelector(
    (state) => state.leaveTypeSlice
  );
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice
  );

  const {currentUser} = useAppSelector(
    (state) => state.userSlice
  );

  const { currentOrganization } = useAppSelector(state => state.organizationsSlice);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypes | null>(
    null
  );
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    search: "",
  });

  const handleEdit = (leaveType: LeaveTypes) => {
    setSelectedLeaveType(leaveType);
    setEditDialogOpen(true);
  };

  const columns = useLeaveTypesColumns(handleEdit, currentOrganization.uuid);

  useEffect(() => {
    if (currentOrganization.uuid) {
      dispatch(
        getLeaveTypesAction({
          org_uuid: currentOrganization.uuid,
          page: pagination.page,
          limit: pagination.limit,
          search: pagination.search,
        })
      );
    }
  }, [dispatch, currentOrganization, pagination]);

  const handlePaginationChange = (newPagination: Partial<PaginationState>) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  return (
    <>
      { hasPermissions("leave_type_management", "read", currentUserRolePermissions , currentUser?.email) ?<div>
      <DataTable
        data={leaveTypes?.rows || []}
        columns={columns}
        isLoading={isLoading}
        totalCount={leaveTypes?.count || 0}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        searchPlaceholder="Filter leave types..."
        noDataMessage="No leave types found."
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
    </div>  : <NoReadPermission />}
    </>
  );
}
