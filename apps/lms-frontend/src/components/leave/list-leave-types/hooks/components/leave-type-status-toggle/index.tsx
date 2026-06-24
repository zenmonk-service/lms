import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppDispatch } from "@/store";
import { deactivateLeaveTypeAction } from "@/features/leave/deactivate-leave-type/deactivate-leave-type.action";
import { activateLeaveTypeAction } from "@/features/leave/activate-leave-type/activate-leave-type.action";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";

interface IProps {
  leaveTypeUUID: string;
  isActive: boolean;
  orgUUID: string;
}

export const LeaveTypeStatusToggle = ({ leaveTypeUUID, isActive, orgUUID }: IProps) => {
  const dispatch = useAppDispatch();
  const [pendingState, setPendingState] = useState<boolean | null>(null);

  const handleToggle = async () => {
    const nextState = !(pendingState ?? isActive);
    setPendingState(nextState);

    try {
      const action = nextState ? activateLeaveTypeAction : deactivateLeaveTypeAction;
      await dispatch(action({ org_uuid: orgUUID, leave_type_uuid: leaveTypeUUID }));
      await dispatch(listLeaveTypesAction({ org_uuid: orgUUID }));
    } finally {
      setPendingState(null);
    }
  };

  const displayedState = pendingState ?? isActive;

  return (
    <div className="flex justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Switch checked={displayedState} onClick={handleToggle} />
          </span>
        </TooltipTrigger>
        <TooltipContent>{displayedState ? "Active" : "Inactive"}</TooltipContent>
      </Tooltip>
    </div>
  );
};