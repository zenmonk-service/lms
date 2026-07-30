import RoleEmployeeMultiSelect from "@/components/leave/list-leave-types/leave-type-modal/components/role-employee-multi-select";
import { OrgSettingsForm } from "@/components/organization/organization.types";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
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

export default function ClubbingAllowed() {
  const { control } = useFormContext<OrgSettingsForm>();
  const isApplicable = useWatch({
    control,
    name: "clubbing_leave_exception.isApplicable",
  });
  return (
    <div>
      <div>
        <div className="mb-4 flex items-center gap-4">
          <h1 className="text-xl font-semibold">Clubbing Exception</h1>
          <Controller
            name="clubbing_leave_exception.isApplicable"
            control={control}
            render={({ field }) => (
              <Field orientation="horizontal" className="w-30">
                <Switch
                  id="switch-carry-forward"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
        </div>
      </div>

      <AnimatePresence>
        {isApplicable && (
          <motion.div
            className="flex gap-1 justify-center flex-col"
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="text-sm text-muted-foreground">
              Select roles or employees who are exceptions to the clubbing
              policy.
            </p>
            <div className="flex gap-6 justify-center">
              <Controller
                control={control}
                name="clubbing_leave_exception.accrual_period"
                render={({ field, fieldState }) => {
                  console.log("✌️fieldState --->", fieldState.error);

                  return (
                    <Field className="gap-1 w-full">
                      <Label className="text-md font-medium mt-2">Accrual Period</Label>

                      <div className="flex items-center gap-2 w-full justify-between">
                        <div className="w-full">
                          {" "}
                          <Select
                            key={field.value}
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="border-0 border-b border-border rounded-none shadow-none w-full">
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
                          {fieldState.invalid && (
                            <FieldError
                              errors={[fieldState.error]}
                              className="text-xs"
                            />
                          )}
                        </div>
                        {field.value && (
                          <button
                            type="button"
                            className="text-sm text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={() => {
                              field.onChange(undefined);
                            }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </Field>
                  );
                }}
              />

              <RoleEmployeeMultiSelect
                control={control}
                name={"clubbing_leave_exception"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
