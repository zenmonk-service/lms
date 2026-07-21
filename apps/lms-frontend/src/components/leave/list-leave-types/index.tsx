"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import DataTable from "@/shared/table";
import { hasPermissions } from "@/lib/has-permission";
import NoPermission from "@/shared/no-permission";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { useLeaveTypesColumns } from "./hooks/use-leave-types-columns";
import LeaveTypeModal from "./leave-type-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const ListLeaveTypes = () => {
  const dispatch = useAppDispatch();

  const { leaveTypes } = useAppSelector((state) => state.leaveSlice);
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const columns = useLeaveTypesColumns(currentOrganization.uuid);

  const filteredLeaveTypes = (leaveTypes?.rows || []).filter((lt) =>
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
    if (currentOrganization.uuid) fetchLeaveTypes();
  }, [currentOrganization.uuid]);

  return (
    <>
      {hasPermissions(
        "leave_type_management",
        "read",
        currentUserRolePermissions,
        currentUser?.email,
      ) ? (
        <DataTable
          columns={columns}
          isLoading={isLoading}
          showPagination={false}
          searchValue={searchTerm}
          data={filteredLeaveTypes}
          onSearchChange={setSearchTerm}
          maxHeight="calc(100vh - 271px)"
          totalCount={filteredLeaveTypes.length}
          searchPlaceholder="Search leaves by name or code..."
          noDataMessage="Establish your organization's leave policies to start managing employee time off. Define accrual rules, eligibility roles, and categorization logic."
        >
          {hasPermissions(
            "leave_type_management",
            "create",
            currentUserRolePermissions,
            currentUser?.email,
          ) && (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="w-5 h-5" /> 
              <span className="hidden sm:block">Create Leave Type</span>
            </Button>
          )}
        </DataTable>
      ) : (
        <NoPermission moduleName="Leave Type Management" />
      )}
      <LeaveTypeModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default ListLeaveTypes;
