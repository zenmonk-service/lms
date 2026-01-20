"use client";

import LeaveTypeForm from "@/components/leave-type/leave-type-form";
import ListLeaveTypes from "@/components/leave-type/list-leave-types";
import { Button } from "@/components/ui/button";
import { hasPermissions } from "@/lib/haspermissios";
import { useAppSelector } from "@/store";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function LeaveTypes() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );

  const { currentUser } = useAppSelector((state) => state.userSlice);

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-11/12 min-[1400px]:w-3/4 p-6">
        <div className="mb-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">Leave Types</h2>
            {hasPermissions(
              "leave_type_management",
              "create",
              currentUserRolePermissions,
              currentUser?.email,
            ) && (
              <Button size="sm" onClick={() => onOpenChange(true)}>
                <Plus className="w-5 h-5" /> Create Leave Type
              </Button>
            )}
            <LeaveTypeForm
              label="create"
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              onClose={onClose}
            />
          </div>
          <p className="text-muted-foreground max-w-80 text-sm">
            Manage organizational leave policies, accrual cycles, and
            accessibility rules.
          </p>
        </div>
        <ListLeaveTypes />
      </div>
    </div>
  );
}
