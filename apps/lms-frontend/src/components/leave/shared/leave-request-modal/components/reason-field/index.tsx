import { LeaveRequestFormData } from "@/components/leave/leave.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Controller, useFormContext } from "react-hook-form";

const ReasonField = () => {
  const { control } = useFormContext<LeaveRequestFormData>();

  return (
    <Controller
      name="reason"
      control={control}
      render={({ field, fieldState }) => (
        <Field className="gap-1">
          <FieldLabel>Reason</FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              {...field}
              placeholder="I'm requesting leave because..."
              rows={6}
              className="min-h-24 resize-none max-h-40 break-all"
              aria-invalid={fieldState.invalid}
              maxLength={255}
            />
            <InputGroupAddon align="block-end">
              <InputGroupText className="tabular-nums">
                {field?.value?.length || 0}/255 characters
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription className="text-xs whitespace-break-spaces">
            Briefly describe why you are requesting this leave.
          </FieldDescription>
          <FieldError errors={[fieldState.error]} className="text-xs" />
        </Field>
      )}
    />
  );
};

export default ReasonField;
