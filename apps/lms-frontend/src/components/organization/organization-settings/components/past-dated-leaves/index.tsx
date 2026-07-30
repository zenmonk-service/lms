"use client";

import {
  Controller,
  useFormContext,
  useWatch,
} from "react-hook-form";
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

export default function PastDatedLeaveSettings() {
  const { control, setValue } = useFormContext<OrgSettingsForm>();
  
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Past-Dated Leaves</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace details and settings for past-dated leaves.
        </p>
      </div>
      <div className="flex gap-6 items-center justify-center">
        <Controller
          control={control}
          name="tenure"
          render={({ field, fieldState }) => (
            <>
              <Field className="gap-1 w-full">
                <Label className="text-sm font-medium">Tenure</Label>

                <div className="flex items-center gap-2 w-full justify-between">
                  <div className="w-full">
                    {" "}
                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="border-0 border-b border-border rounded-none shadow-none w-full">
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-xs">Tenure</SelectLabel>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="half_yearly">Half Yearly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {field.value && (
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-destructive cursor-pointer"
                      onClick={() => {
                        field.onChange("");
                        setValue("balance", null);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </Field>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} className="text-xs" />
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="balance"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-1">
                <label className="text-sm font-medium">
                  Maximum Allowed Past-Dated Leaves
                </label>

                <Input
                  type="number"
                  disabled={!useWatch({ control, name: "tenure" })}
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
      </div>
    </div>
  );
}
