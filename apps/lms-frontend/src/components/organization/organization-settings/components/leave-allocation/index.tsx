import { OrgSettingsForm } from "@/components/organization/organization.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import Collapse from "@/shared/motion/collapse";
import { Info } from "lucide-react";
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

const LeaveAllocation = () => {
  const { control, setValue, formState } = useFormContext<OrgSettingsForm>();

  const isLeaveAllocationApplicable = useWatch({
    control,
    name: "leave_allocation_policy.is_applicable",
  });


  const handleApplicableChange = (
    checked: boolean,
    onChange: (value: boolean) => void,
  ) => {
    onChange(checked);

    if (!checked) {
      const cut_off = formState.defaultValues?.leave_allocation_policy?.cut_off;
      
      setValue("leave_allocation_policy.cut_off", cut_off ?? null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex justify-between gap-4">
          <div>
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">
                First-Month Leave Allocation Cut-off
              </h1>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={20} className="text-muted-foreground" />
                </TooltipTrigger>

                <TooltipContent side="top" className="w-64">
                  If enabled, you can set a joining date cut-off day to determine if new hires qualify for leave credit during their first month. Employees joining on or before the cut-off day will receive leave for the current month, while those joining after will not.
                </TooltipContent>
              </Tooltip>
            </div>

            <p className="text-xs text-muted-foreground">
              Set a joining date cut-off day to determine if new hires qualify
              for leave credit during their first month.
            </p>
          </div>

          <Controller
            name="leave_allocation_policy.is_applicable"
            control={control}
            render={({ field }) => (
              <Switch
                id="switch-leave-allocation-cutoff"
                checked={field.value}
                onCheckedChange={(checked) =>
                  handleApplicableChange(checked, field.onChange)
                }
              />
            )}
          />
        </div>
      </div>

      <Collapse open={Boolean(isLeaveAllocationApplicable)}>
        <Controller
          name="leave_allocation_policy.cut_off"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1 mt-4">
              <FieldLabel>
                Cut-off Day of Month
                <span className="text-destructive">*</span>
              </FieldLabel>

              <Input
                type="number"
                min={1}
                max={31}
                placeholder="Enter cutoff day"
                value={field.value ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    field.onChange(null);
                    return;
                  }
                  const num = Number(raw);
                  field.onChange(Number.isNaN(num) ? null : num);
                }}
                aria-invalid={!!fieldState.error}
              />
              <FieldDescription className="text-xs wrap-break-word">
                Employees joining on or before day {Number.isNaN(field.value) ? "-" : field.value} get current
                month leave.
              </FieldDescription>

              <FieldError errors={[fieldState.error]} className="text-xs" />
            </Field>
          )}
        />
      </Collapse>
    </div>
  );
};

export default LeaveAllocation;