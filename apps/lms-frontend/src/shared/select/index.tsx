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

interface EnumData {
  [key: string]: string;
}

interface CustomSelectProps {
  ref?: React.Ref<any>;
  value: string;
  onValueChange: (value: string) => void;
  data: any;
  isEnum?: boolean;
  label: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  ref,
  value,
  onValueChange,
  data,
  isEnum = false,
  label,
  placeholder,
  className,
  disabled = false,
}) => {
  return (
    <div>
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
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-xs">{label}</SelectLabel>
            {isEnum
              ? Object.entries(data as EnumData).map(([key, val]) => {
                  return (
                    <SelectItem key={key} value={val}>
                      {val
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  );
                })
              : (data as any).map((type: any, index: number) => (
                  <SelectItem
                    key={type?.uuid || index}
                    value={type?.uuid || type}
                  >
                    {type?.name ||
                      type
                        ?.replace(/_/g, " ")
                        ?.replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </SelectItem>
                ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomSelect;
