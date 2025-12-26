import { Field, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserIdPattern } from "@/features/organizations/organizations.type";
import { Fingerprint, Hash } from "lucide-react";
import { Control, Controller } from "react-hook-form";

interface IdentifierPatternsProps {
  control: Control<any>;
}

const IdentifierPatterns = ({ control }: IdentifierPatternsProps) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Identifier Patterns</h1>
        <p className="text-sm text-muted-foreground">
          Manage the logic for auto-generating employee and project IDs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
              Employee id pattern type
            </h2>
            <Controller
              name="employee_id_pattern_type"
              control={control}
              render={({ field }) => (
                <Field className="gap-1">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="px-0 border-0 border-b border-border rounded-none shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-xs">
                          Employee ID Pattern Type
                        </SelectLabel>
                        {Object.values(UserIdPattern).map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>
                            {pattern
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <div>
            <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
              Employee ID Pattern
            </h2>
            <Controller
              name="employee_id_pattern_value"
              control={control}
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <InputGroup className="rounded-none border-0 border-b border-border shadow-none">
                    <InputGroupAddon align={"inline-start"} className="pl-0">
                      <Hash
                        className="w-3 h-3 text-muted-foreground"
                        strokeWidth={2}
                      />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="text-xs"
                    />
                  )}
                </Field>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Sample Output
            </p>
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-3">
                <Fingerprint size={18} className="text-orange-500" />
                <span className="font-mono font-bold text-lg text-slate-800">
                  EMP-2025-05-19-001
                </span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <Fingerprint size={18} className="text-slate-300" />
                <span className="font-mono font-bold text-lg text-slate-400">
                  EMP-2025-05-20-002
                </span>
              </div>
            </div>
            <Fingerprint
              size={120}
              className="absolute -right-10 -bottom-10 text-slate-100 -rotate-12 transition-transform group-hover:rotate-0 duration-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentifierPatterns;
