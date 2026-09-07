import { LeaveTypeFormData } from "@/components/leave/leave.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useFormContext } from "react-hook-form";

const MinTenure = () => {
  const { control } = useFormContext<LeaveTypeFormData>();

  return (
    <Controller
      name="min_tenure_months"
      control={control}
      render={({ field, fieldState }) => (
        <Field className="gap-1">
          <FieldLabel>
            Minimum Tenure (months){" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...field}
            inputMode="numeric"
            placeholder="e.g. 3"
            value={field.value ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                field.onChange(value);
              }
            }}
            aria-invalid={fieldState.invalid}
          />
          <FieldDescription className="text-xs whitespace-normal wrap-break-word">
            Employees must complete this many months before they can use this
            leave type. Set 0 for no restriction.
          </FieldDescription>
          <FieldError errors={[fieldState.error]} className="text-xs" />
        </Field>
      )}
    />
  );
};

export default MinTenure;
