import { OrgSettingsForm } from "@/components/organization/organization.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
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
import { CutoffAllocationType } from "@/features/organizations/organizations.types";

const LeaveAllocation = () => {
  const { control, setValue, formState } = useFormContext<OrgSettingsForm>();

  const isLeaveAllocationApplicable = useWatch({
    control,
    name: "leave_allocation_cutoff.isApplicable",
  });

  const allocationOptions: Record<CutoffAllocationType, string> = {
    [CutoffAllocationType.HALF_MONTH]: "Grant Half Month Leave Quota",
    [CutoffAllocationType.FULL_MONTH]: "Grant Full Month Leave Quota",
    [CutoffAllocationType.NO_LEAVE]: "No Leave (Start from Next Month)",
  };

  const handleApplicableChange = (
    checked: boolean,
    onChange: (value: boolean) => void,
  ) => {
    onChange(checked);

    if (!checked) {
      // Revert to the values this form was initialized/reset with (i.e. what
      // buildDefaultValues produced from the last-saved organizationSettings),
      // rather than clearing to undefined or hardcoding arbitrary fallbacks.
      const defaults = formState.defaultValues?.leave_allocation_cutoff;

      setValue("leave_allocation_cutoff.cutoff", defaults?.cutoff, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue(
        "leave_allocation_cutoff.allocation_type",
        defaults?.allocation_type,
        { shouldValidate: true, shouldDirty: true },
      );
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
            name="leave_allocation_cutoff.isApplicable"
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

      <Collapse open={isLeaveAllocationApplicable}>
        <div className="mt-4 grid gird-cols-1 sm:grid-cols-2 gap-6">
          <Controller
            name="leave_allocation_cutoff.cutoff"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel>
                  Cut-off Day of Month{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>

                <Input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Enter cutoff day"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value),
                    )
                  }
                  aria-invalid={!!fieldState.error}
                />
                <FieldDescription className="text-xs wrap-break-word">
                  Employees joining on or before day {field.value} get current
                  month leave.
                </FieldDescription>

                <FieldError errors={[fieldState.error]} className="text-xs" />
              </Field>
            )}
          />
          <Controller
            name="leave_allocation_cutoff.allocation_type"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel>
                  First Month Allocation Logic{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>

                <Select
                  key={field.value}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    aria-invalid={!!fieldState.error}
                    value={field.value}
                    onReset={() => field.onChange("")}
                    className={cn(
                      "border-0 border-b rounded-none shadow-none w-full",
                    )}
                  >
                    <SelectValue placeholder="Select allocation type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs">
                        Allocation Type
                      </SelectLabel>
                      {Object.values(CutoffAllocationType).map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="capitalize"
                        >
                          {allocationOptions[type]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FieldError errors={[fieldState.error]} className="text-xs" />
              </Field>
            )}
          />
        </div>
      </Collapse>
    </div>
  );
};

export default LeaveAllocation;