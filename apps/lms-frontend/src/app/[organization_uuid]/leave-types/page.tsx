"use client";

import LeaveTypeForm from "@/components/leave-type/leave-type-form";
import ListLeaveTypes from "@/components/leave-type/list-leave-types";
import { Button } from "@/components/ui/button";
import { hasPermissions } from "@/lib/haspermissios";
import Title from "@/shared/typography/title";
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

  const handleClick = () => {
    onOpenChange(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-11/12 min-[1400px]:w-3/4 p-6">
        <Title
          title={{
            text: "Leave Types",
            className: "",
          }}
          description={{
            text: "Manage your leave types and their configurations.",
            className: "",
          }}
          className=""
          button={
            hasPermissions(
              "leave_type_management",
              "create",
              currentUserRolePermissions,
              currentUser?.email,
            ) && (
              <Button size="sm" onClick={handleClick}>
                <Plus className="w-5 h-5" /> Create Leave Type
              </Button>
            )
          }
        />
        <LeaveTypeForm
          label="create"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onClose={onClose}
        />
        <ListLeaveTypes />
      </div>
    </div>
  );
}
