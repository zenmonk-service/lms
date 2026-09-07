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
import { LoaderCircle, CircleX } from "lucide-react";
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
  /** Fires when the dropdown opens/closes — lazily fetch options on first open. */
  onOpenChange?: (open: boolean) => void;
  /** Show a clear (x) affordance when a value is set. Requires `onReset`. */
  clearable?: boolean;
  /** Called when the clear affordance is clicked. Implies `clearable`. */
  onReset?: () => void;
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
  onOpenChange,
  clearable,
  onReset,
  ...triggerProps
}: CustomSelectProps<T>) {
  const showClear = Boolean(onReset) && (clearable ?? true) && value !== "";

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      onOpenChange={onOpenChange}
    >
      <div className="relative">
        <SelectTrigger
          className={cn(showClear && "pr-8", className)}
          disabled={disabled}
          value={value}
          {...triggerProps}
        >
          <SelectValue placeholder={placeholder ?? "Select a value"} />
        </SelectTrigger>

        {showClear && (
          <CircleX
            role="button"
            aria-label="Clear selection"
            className="absolute right-2 top-1/2 size-4 -translate-y-1/2 cursor-pointer opacity-50 hover:opacity-100"
            onPointerDown={(e) => {
              // Stop the trigger from opening the dropdown on this click.
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReset?.();
            }}
          />
        )}
      </div>

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
            data.map((item, index) => (
              <SelectItem key={index} value={getValue(item)}>
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
