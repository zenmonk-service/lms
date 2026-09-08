import { LeaveTypeFormData } from "@/components/leave/leave.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useFormContext } from "react-hook-form";

const BasicInfo = () => {
  const { control } = useFormContext<LeaveTypeFormData>();

  return (
    <>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel>
              Leave Type Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="Annual Leave"
              maxLength={100}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} className="text-xs" />
          </Field>
        )}
      />

      <Controller
        name="code"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel>
              Unique Code <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              {...field}
              value={field.value ?? ""}
              onChange={(event) =>
                field.onChange(event.target.value.toUpperCase())
              }
              placeholder="AL"
              maxLength={50}
              aria-invalid={fieldState.invalid}
              className="uppercase"
            />
            <FieldError errors={[fieldState.error]} className="text-xs" />
          </Field>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel>Description</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                placeholder="I'm requesting leave because..."
                rows={4}
                className="min-h-14 resize-none max-h-40 break-all"
                aria-invalid={fieldState.invalid}
                maxLength={255}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="tabular-nums">
                  {field?.value?.length || 0}/255 characters
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription className="text-xs whitespace-normal wrap-break-word">
              Optional: provide a short description for this leave type.
            </FieldDescription>
          </Field>
        )}
      />
    </>
  );
};

export default BasicInfo;
