import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

interface EnumData {
  [key: string]: string;
}

interface CustomSelectProps {
  ref?: React.Ref<any>;
  value: string;
  onValueChange: (value: string) => void;
  data: any;
  isEnum?: boolean;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  ref,
  value,
  onValueChange,
  data,
  isEnum = false,
  label,
  placeholder,
  emptyMessage = "No options found",
  className,
  disabled = false,
  isLoading = false,
}) => {
  let optionsContent: React.ReactNode;
  let hasData = false;

  if (Array.isArray(data)) {
    hasData = data.length > 0;
  } else if (isEnum) {
    hasData = Object.keys(data ?? {}).length > 0;
  } else {
    hasData = Boolean(data);
  }

  if (isLoading) {
    optionsContent = (
      <SelectItem value="__loading__" disabled>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading options...
        </span>
      </SelectItem>
    );
  } else if (!hasData) {
    optionsContent = (
      <SelectItem value="__empty__" disabled>
        <span className="text-xs text-muted-foreground">{emptyMessage}</span>
      </SelectItem>
    );
  } else if (isEnum) {
    optionsContent = Object.entries(data as EnumData).map(([key, val]) => (
      <SelectItem key={key} value={val}>
        {val
          .replaceAll("_", " ")
          .replaceAll(/\b\w/g, (c) => c.toUpperCase())}
      </SelectItem>
    ));
  } else {
    optionsContent = (data as any[]).map((type: any, index: number) => (
      <SelectItem key={type?.uuid || index} value={type?.uuid || type}>
        {type?.name ||
          type
            ?.replaceAll("_", " ")
            ?.replaceAll(/\b\w/g, (c: string) => c.toUpperCase())}
      </SelectItem>
    ));
  }

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v)}>
      <SelectTrigger
        ref={ref}
        value={value}
        onReset={() => onValueChange("")}
        className={cn(className)}
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder || "Select a value"} />
      </SelectTrigger>
      <SelectContent position="popper" side="bottom" sideOffset={4}>
        <SelectGroup className="max-h-50 overflow-y-auto">
          {label && <SelectLabel className="text-xs">{label}</SelectLabel>}
          {optionsContent}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
