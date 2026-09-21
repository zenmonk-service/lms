import { LeaveRequestFormData } from "@/components/leave/leave.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import CustomSelect from "@/shared/select";
import { useAppSelector } from "@/store";
import { Controller, useFormContext } from "react-hook-form";

const tenureInMonths = (dateOfJoining: string) => {
  const joined = new Date(dateOfJoining);
  const now = new Date();
  let months =
    (now.getFullYear() - joined.getFullYear()) * 12 +
    (now.getMonth() - joined.getMonth());
  if (now.getDate() < joined.getDate()) months -= 1;
  return months;
};

const meetsMinTenure = (
  dateOfJoining: string | null | undefined,
  minTenureMonths: number | null | undefined,
) => {
  if (!minTenureMonths) return true;
  if (!dateOfJoining) return true;
  return tenureInMonths(dateOfJoining) >= minTenureMonths;
};

const LeaveTypeField = () => {
  const { control } = useFormContext<LeaveRequestFormData>();
  const { userLeaveTypes, leaveTypesLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );
  const { currentUser } = useAppSelector((state) => state.userSlice);

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
            data={userLeaveTypes.filter(
              (lt) =>
                lt.is_active &&
                meetsMinTenure(currentUser.date_of_joining, lt.min_tenure_months),
            )}
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
