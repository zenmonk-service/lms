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

export default function ClubbingAllowed() {
  const { control } = useFormContext<OrgSettingsForm>();

  const isClubbingApplicable = useWatch({
    control,
    name: "clubbing_leave_exception.is_applicable",
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex justify-between gap-4">
          <div>
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">Clubbing Exception</h1>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={20} className="text-muted-foreground" />
                </TooltipTrigger>

                <TooltipContent side="top" className="w-64">
                  Exclude selected employees or roles from the clubbing policy
                  for a one-time in a defined period.
                </TooltipContent>
              </Tooltip>
            </div>

            <p className="text-xs text-muted-foreground">
              Select roles or employees who are exceptions to the clubbing
              policy.
            </p>
          </div>

          <Controller
            name="clubbing_leave_exception.is_applicable"
            control={control}
            render={({ field }) => (
              <Switch
                id="switch-clubbing-exception"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <Collapse open={isClubbingApplicable}>
        <div className="mt-4 grid grid-cols-1 gap-6 items-center">
          <div className="flex gap-2">
            <Controller
              name="clubbing_leave_exception.tenure"
              control={control}
              render={({ field, fieldState }) => (
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
                      onReset={() => field.onChange("")}
                      className={cn(
                        "border-0 border-b rounded-none shadow-none w-full",
                      )}
                    >
                      <SelectValue placeholder="Select accrual period" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-xs">
                          Accrual Period
                        </SelectLabel>

                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="half_yearly">Half Yearly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              )}
            />
            <Controller
              name="clubbing_leave_exception.balance"
              control={control}
              render={({ field, fieldState }) => {
                return (
                  <Field className="gap-1">
                    <FieldLabel>
                      Exception Balance{" "}
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
        </div>
      </Collapse>
    </div>
  );
}
