import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { LeaveRequestModal } from "./leave-request-modal";
import { useAppSelector } from "@/store";

const MakeLeaveRequest = () => {
  const [open, setOpen] = useState(false);

  function onOpenChange(value: boolean) {
    setOpen(value);
  }

  function onClose() {
    setOpen(false);
  }

  return (
    <div>
      <Button
        className=" text-white"
        size="sm"
        onClick={() => onOpenChange(true)}
      >
        <Plus className="w-5 h-5" /> Request Leave
      </Button>
      <LeaveRequestModal
        open={open}
        onOpenChange={onOpenChange}
        onClose={onClose}
      />
    </div>
  );
};

export default MakeLeaveRequest;
