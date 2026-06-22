import { LeaveTypeFormData } from "@/components/leave/leave.types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CalendarCog, CircleAlert, Sandwich, Users } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

const ClubbingAndSandwich = () => {
  const { control, watch } = useFormContext<LeaveTypeFormData>();

  const isSandwich = watch("is_sandwich_enabled");
  const isClubbing = watch("is_clubbing_enabled");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="bg-muted p-2 rounded-lg">
          <CalendarCog className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <p className="text-sm">Configure Leave Policy</p>
          <p className="text-xs">
            Enable different leave calculation modes. Multiple modes can be
            active simultaneously.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Controller
          name="is_sandwich_enabled"
          control={control}
          render={({ field }) => (
            <Label className="hover:bg-accent/50 flex items-start justify-between gap-3 rounded-lg border p-3 has-aria-checked:border-primary has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary dark:has-aria-checked:bg-primary/10">
              <div className="bg-muted p-2 rounded-lg">
                <Sandwich className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Enable Sandwich</p>
                <p className="text-muted-foreground text-xs">
                  Employees are not permitted to take leave immediately before
                  or after public holidays; any intervening holidays will be
                  counted as leave days.
                </p>
              </div>
              <Checkbox
                id="toggle-sandwich"
                className="ml-auto"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Label>
          )}
        />

        <Controller
          name="is_clubbing_enabled"
          control={control}
          render={({ field }) => (
            <Label className="hover:bg-accent/50 flex items-start justify-between gap-3 rounded-lg border p-3 has-aria-checked:border-primary has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary dark:has-aria-checked:bg-primary/10">
              <div className="bg-muted p-2 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Enable Clubbing</p>
                <p className="text-muted-foreground text-xs">
                  Different leave types cannot be combined into a single
                  continuous leave period; consecutive leaves will be treated as
                  one block and deducted accordingly.
                </p>
              </div>
              <Checkbox
                id="toggle-clubbing"
                className="ml-auto"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Label>
          )}
        />
      </div>

      <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
        <CircleAlert className="w-4 h-4" />
        <p className="text-xs">
          <span className="font-semibold">Current Mode Configuration:</span>{" "}
          {isSandwich && isClubbing
            ? "Hybrid mode (Sandwich + Clubbing) active."
            : isSandwich
              ? "Sandwich logic active."
              : isClubbing
                ? "Clubbing logic active."
                : "Standard execution only."}
        </p>
      </div>
    </div>
  );
};

export default ClubbingAndSandwich;
