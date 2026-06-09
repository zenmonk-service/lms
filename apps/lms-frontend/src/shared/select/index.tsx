import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { ComponentProps } from "react";

interface CustomSelectProps<T> extends Omit<ComponentProps<typeof SelectTrigger>, "value"> {
  value: string;
  onValueChange: (value: string) => void;
  data: T[];
  getValue: (item: T) => string;
  getLabel: (item: T) => string;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

function CustomSelect<T>({
  value,
  onValueChange,
  data,
  getValue,
  getLabel,
  label,
  placeholder,
  emptyMessage = "No options found",
  className,
  disabled = false,
  isLoading = false,
  ...triggerProps
}: CustomSelectProps<T>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn(className)} disabled={disabled} {...triggerProps}>
        <SelectValue placeholder={placeholder ?? "Select a value"} />
      </SelectTrigger>

      <SelectContent position="popper" side="bottom" sideOffset={4}>
        <SelectGroup className="max-h-50 overflow-y-auto">
          {label && <SelectLabel>{label}</SelectLabel>}

          {isLoading ? (
            <SelectItem value="__loading__" disabled>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading options...
              </span>
            </SelectItem>
          ) : data.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              {emptyMessage}
            </SelectItem>
          ) : (
            data.map((item) => (
              <SelectItem key={getValue(item)} value={getValue(item)}>
                {getLabel(item)}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default CustomSelect;
