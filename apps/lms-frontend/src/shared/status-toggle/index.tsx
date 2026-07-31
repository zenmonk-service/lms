import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IProps {
  active: boolean;
  onActive: () => Promise<void>;
  onInactive: () => Promise<void>;
}

export const StatusToggle = ({ active, onActive, onInactive }: IProps) => {
  const [checked, setChecked] = useState(active);

  const handleToggle = async (state: boolean) => {
    try {
      setChecked(state);
      state ? await onActive() : await onInactive();
    } catch (error) { setChecked(active); }
  };

  return (
    <div className="flex justify-center ">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Switch checked={checked} onCheckedChange={handleToggle} />
          </span>
        </TooltipTrigger>
        <TooltipContent>{checked ? "Active" : "Inactive"}</TooltipContent>
      </Tooltip>
    </div>
  );
};