"use client";

import LeaveTypeForm from "@/components/leave-type/leave-type-form";
import ListLeaveTypes from "@/components/leave-type/list-leave-types";
import { Button } from "@/components/ui/button";
import { hasPermissions } from "@/libs/haspermissios";
import { useAppSelector } from "@/store";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function LeaveTypes() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice
  );

  const { currentUser } = useAppSelector((state) => state.userSlice);

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All Leave Types</h2>
          <p className="text-sm text-muted-foreground">
            List of configured leave types for the organization.
          </p>
        </div>
        <div>
          {hasPermissions(
            "leave_type_management",
            "create",
            currentUserRolePermissions,
            currentUser?.email
          ) && (
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              size="sm"
              onClick={() => onOpenChange(true)}
            >
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
      </div>

      <ListLeaveTypes />
    </div>
  );
}
