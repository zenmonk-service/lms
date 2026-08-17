"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import DataTable from "@/shared/table";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { useLeaveTypesColumns } from "./hooks/use-leave-types-columns";
import LeaveTypeModal from "./leave-type-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";

const ListLeaveTypes = () => {
  const dispatch = useAppDispatch();

  const { leaveTypes } = useAppSelector((state) => state.leaveSlice);
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);

  const can = usePermissionCheck();
  const canReadLeaveTypes = can(PermissionTag.LEAVE_TYPE_MANAGEMENT, PermissionAction.READ);
  const canCreateLeaveTypes = can(PermissionTag.LEAVE_TYPE_MANAGEMENT, PermissionAction.CREATE);

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const columns = useLeaveTypesColumns(currentOrganization.uuid);

  const filteredLeaveTypes = (leaveTypes || []).filter((lt) =>
    searchTerm.trim() === ""
      ? true
      : lt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lt.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    await dispatch(listLeaveTypesAction({ org_uuid: currentOrganization.uuid }));
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentOrganization.uuid && canReadLeaveTypes) fetchLeaveTypes();
  }, [currentOrganization.uuid, canReadLeaveTypes]);

  return (
    <>
      <DataTable
        columns={columns}
        hasPermission={canReadLeaveTypes}
        isLoading={isLoading}
        showPagination={false}
        searchValue={searchTerm}
        data={filteredLeaveTypes}
        onSearchChange={setSearchTerm}
        maxHeight="calc(100vh - 271px)"
        totalCount={filteredLeaveTypes.length}
        moduleName="Leave Type Management"
        searchPlaceholder="Search leaves by name or code..."
        noDataMessage="Establish your organization's leave policies to start managing employee time off. Define accrual rules, eligibility roles, and categorization logic."
      >
        {canCreateLeaveTypes && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:block">Create Leave Type</span>
          </Button>
        )}
      </DataTable>

      <LeaveTypeModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default ListLeaveTypes;
