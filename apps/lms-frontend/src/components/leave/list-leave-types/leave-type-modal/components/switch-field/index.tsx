import { LeaveTypeFormData } from "@/components/leave/leave.types";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { LucideIcon } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

/** Boolean form fields that render as a plain switch row. */
type SwitchFieldName =
  | "carry_forward"
  | "is_full_day_only"
  | "allow_negative_leaves"
  | "is_sandwich_enabled"
  | "is_clubbing_enabled";

interface IProps {
  name: SwitchFieldName;
  icon: LucideIcon;
  title: string;
  description: string;
}

const SwitchField = ({ name, icon: Icon, title, description }: IProps) => {
  const { control } = useFormContext<LeaveTypeFormData>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FieldLabel htmlFor={`switch-${name}`}>
          <Field orientation="horizontal">
            <FieldContent className="min-w-0">
              <div className="flex gap-2">
                <div className="bg-muted p-2 rounded-lg h-fit shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <FieldTitle className="font-semibold whitespace-normal wrap-break-word">
                    {title}
                  </FieldTitle>
                  <FieldDescription className="text-xs whitespace-normal wrap-break-word">
                    {description}
                  </FieldDescription>
                </div>
              </div>
            </FieldContent>
            <Switch
              id={`switch-${name}`}
              className="shrink-0"
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        </FieldLabel>
      )}
    />
  );
};

export default SwitchField;
