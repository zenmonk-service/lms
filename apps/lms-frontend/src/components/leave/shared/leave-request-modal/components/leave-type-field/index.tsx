import { LeaveRequestFormData } from "@/components/leave/leave.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import CustomSelect from "@/shared/select";
import { useAppSelector } from "@/store";
import { Controller, useFormContext } from "react-hook-form";

const LeaveTypeField = () => {
  const { control } = useFormContext<LeaveRequestFormData>();
  const { leaveTypes, leaveTypesLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );

  return (
    <Controller
      name="leave_type_uuid"
      control={control}
      render={({ field, fieldState }) => (
        <Field className="gap-1">
          <FieldLabel>
            Leave Type <span className="text-destructive">*</span>
          </FieldLabel>
          <CustomSelect
            ref={field.ref}
            value={field.value}
            aria-invalid={fieldState.invalid}
            onValueChange={field.onChange}
            getValue={(item) => item.uuid}
            getLabel={(item) => item.name}
            data={leaveTypes.filter((lt) => lt.is_active)}
            isLoading={leaveTypesLoading}
            label="Leaves"
            placeholder="Select a leave"
            emptyMessage="No leave type found"
            className="w-full"
          />
          <FieldError errors={[fieldState.error]} className="text-xs" />
        </Field>
      )}
    />
  );
};

export default LeaveTypeField;
