import RoleEmployeeMultiSelect from "@/components/leave/list-leave-types/leave-type-modal/components/role-employee-multi-select";
import { OrgSettingsForm } from "@/components/organization/organization.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import Collapse from "@/shared/motion/collapse";
import { Input } from "@/components/ui/input";

export default function SandwichAllowed() {
  const { control } = useFormContext<OrgSettingsForm>();

  const isSandwichApplicable = useWatch({
    control,
    name: "sandwich_leave_exception.isApplicable",
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex justify-between gap-4">
          <div>
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">Sandwich Exception</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={20} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top" className="w-64">
                  Exclude selected employees or roles from the sandwich policy
                  for a one-time in defined period.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xs text-muted-foreground">
              Select roles or employees who are exceptions to the sandwich
              policy.
            </p>
          </div>
          <Controller
            name="sandwich_leave_exception.isApplicable"
            control={control}
            render={({ field }) => (
              <Switch
                id="switch-sandwich-exception"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <Collapse open={isSandwichApplicable}>
        <div className="mt-4 grid grid-cols-1 gap-6">
          <div className="flex gap-2">
            <Controller
              name="sandwich_leave_exception.tenure"
              control={control}
              render={({ field, fieldState }) => {
                return (
                  <Field className="gap-1">
                    <FieldLabel>
                      Tenure <span className="text-destructive">*</span>
                    </FieldLabel>

                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        aria-invalid={!!fieldState.error}
                        value={field.value}
                        onReset={() => {
                          field.onChange("");
                        }}
                        className={cn(
                          "border-0 border-b rounded-none shadow-none w-full",
                        )}
                      >
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-xs">Tenure</SelectLabel>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="half_yearly">
                            Half Yearly
                          </SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                );
              }}
            />
            <Controller
              name="sandwich_leave_exception.count"
              control={control}
              render={({ field, fieldState }) => {
                return (
                  <Field className="gap-1">
                    <FieldLabel>
                      Exception Count{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>

                    <Input
                      type="number"
                      min={1}
                      placeholder="Enter Count"
                      value={
                        field.value == null || field.value === 0
                          ? ""
                          : field.value.toString()
                      }
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />

                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  </Field>
                );
              }}
            />
          </div>
          {isSandwichApplicable && (
            <RoleEmployeeMultiSelect
              control={control}
              name={"sandwich_leave_exception"}
            />
          )}
        </div>
      </Collapse>
    </div>
  );
}
