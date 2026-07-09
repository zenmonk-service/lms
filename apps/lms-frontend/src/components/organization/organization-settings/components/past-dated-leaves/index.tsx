"use client";

import {
  Control,
  Controller,
  UseFormSetValue,
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
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

interface IProps {
  control: Control<OrgSettingsForm>;
  setValue: UseFormSetValue<OrgSettingsForm>;
}
export default function PastDatedLeaveSettings({ control, setValue }: IProps) {
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
          render={({ field }) => (
            <Field className="gap-1 w-full">
              <Label className="text-sm font-medium">Tenure</Label>

              <div className="flex items-center gap-2 w-full justify-between">
                <div className="w-full">
                  {" "}
                  <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-0 border-b border-border rounded-none shadow-none w-full">
                      <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-xs">Tenure</SelectLabel>

                        <SelectItem value="1">Monthly</SelectItem>
                        <SelectItem value="3">Quarterly</SelectItem>
                        <SelectItem value="6">Half Yearly</SelectItem>
                        <SelectItem value="12">Yearly</SelectItem>
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
          )}
        />

        <Controller
          control={control}
          name="balance"
          render={({ field }) => {
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
              </Field>
            );
          }}
        />
      </div>
    </div>
  );
}
