"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrgSettingsForm } from "@/components/organization/organization.types";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/event-management/components/date-picker";
import { Switch } from "@/components/ui/switch";
import Collapse from "@/shared/motion/collapse";

export default function LateExceptionSettings() {
  const { control  } = useFormContext<OrgSettingsForm>();

  const isLateExceptionApplicable = useWatch({
    control,
    name: "late_exception.is_applicable",
  });

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Late Exceptions</h1>
            <p className="text-sm text-muted-foreground">
              Manage your workspace details and settings for late exceptions.
            </p>
          </div>
          <Controller
            name="late_exception.is_applicable"
            control={control}
            render={({ field }) => (
              <Switch
                id="switch-late-exception"
                checked={field.value}
                onCheckedChange={(val) => {
                  field.onChange(val);
                }}
              />
            )}
          />
        </div>
      </div>

      <Collapse open={isLateExceptionApplicable}>
        <div className="flex gap-6  justify-center sm:flex-row flex-col">
          <Controller
            control={control}
            name="late_exception.tenure"
            render={({ field, fieldState }) => (
              <div className="w-full">
                <div className="w-full">
                  <Field className=" gap-1 w-full">
                    <Label className="text-sm font-medium">Tenure</Label>

                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="w-full">
                        {" "}
                        <Select
                          key={field.value}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className="border-0 border-b border-border rounded-none shadow-none w-full"
                            value={field.value}
                          >
                            <SelectValue placeholder="Select tenure" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="text-xs">
                                Tenure
                              </SelectLabel>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">
                                Quarterly
                              </SelectItem>
                              <SelectItem value="half_yearly">
                                Half Yearly
                              </SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Field>
                </div>
                <div>
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  )}
                </div>
              </div>
            )}
          />

          <Controller
            control={control}
            name="late_exception.balance"
            render={({ field, fieldState }) => {
              return (
                <Field className="gap-1">
                  <label className="text-sm font-medium">
                    Maximum Allowed Late Exceptions
                  </label>

                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter limit"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs ml-3"
                    />
                  )}
                </Field>
              );
            }}
          />

          <Controller
            control={control}
            name="late_exception.time"
            render={({ field, fieldState }) => {
              return (
                <Field className="gap-1">
                  <label className="text-sm font-medium">
                    Maximum Allowed Late time
                  </label>
                  <div className="mt-4 ">
                    <TimePicker
                      date={field.value}
                      hourCycle={24}
                      granularity="minute"
                      onChange={(value) =>
                        field.onChange(!value ? null :  value)
                      }
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs ml-3"
                    />
                  )}
                </Field>
              );
            }}
          />
        </div>
      </Collapse>
    </div>
  );
}
